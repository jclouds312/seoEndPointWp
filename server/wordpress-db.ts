
import { Pool } from 'pg';

interface WordPressPost {
  ID: number;
  post_author: number;
  post_date: Date;
  post_content: string;
  post_title: string;
  post_status: string;
  post_name: string;
  post_modified: Date;
  post_type: string;
}

interface WordPressPostMeta {
  meta_id: number;
  post_id: number;
  meta_key: string;
  meta_value: string;
}

class WordPressDatabase {
  private pool: Pool;
  private tablePrefix: string;

  constructor(connectionString: string, tablePrefix: string = 'wp_') {
    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    this.tablePrefix = tablePrefix;
  }

  // Obtener posts por categoría de lesiones personales
  async getPersonalInjuryPosts(limit: number = 50): Promise<WordPressPost[]> {
    const query = `
      SELECT p.* 
      FROM ${this.tablePrefix}posts p
      INNER JOIN ${this.tablePrefix}term_relationships tr ON p.ID = tr.object_id
      INNER JOIN ${this.tablePrefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      INNER JOIN ${this.tablePrefix}terms t ON tt.term_id = t.term_id
      WHERE p.post_type = 'post' 
      AND p.post_status = 'publish'
      AND (
        t.name LIKE '%injury%' 
        OR t.name LIKE '%accident%' 
        OR t.name LIKE '%lawyer%'
        OR p.post_title LIKE '%injury%'
        OR p.post_title LIKE '%accident%'
      )
      ORDER BY p.post_date DESC
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }

  // Obtener metadata SEO de Yoast
  async getYoastSEOData(postId: number): Promise<Record<string, any>> {
    const query = `
      SELECT meta_key, meta_value 
      FROM ${this.tablePrefix}postmeta 
      WHERE post_id = $1 
      AND meta_key LIKE '_yoast_wpseo_%'
    `;
    
    const result = await this.pool.query(query, [postId]);
    
    const seoData: Record<string, any> = {};
    result.rows.forEach((row: WordPressPostMeta) => {
      const key = row.meta_key.replace('_yoast_wpseo_', '');
      seoData[key] = row.meta_value;
    });
    
    return seoData;
  }

  // Insertar nuevo post
  async insertPost(data: {
    title: string;
    content: string;
    status?: string;
    author?: number;
    type?: string;
  }): Promise<number> {
    const {
      title,
      content,
      status = 'draft',
      author = 1,
      type = 'post'
    } = data;

    const query = `
      INSERT INTO ${this.tablePrefix}posts (
        post_author, post_date, post_date_gmt, post_content, 
        post_title, post_status, post_name, post_modified, 
        post_modified_gmt, post_type
      ) VALUES (
        $1, NOW(), NOW(), $2, $3, $4, $5, NOW(), NOW(), $6
      )
      RETURNING ID
    `;

    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const result = await this.pool.query(query, [
      author,
      content,
      title,
      status,
      slug,
      type
    ]);

    return result.rows[0].id;
  }

  // Actualizar metadata SEO de Yoast
  async updateYoastSEO(postId: number, seoData: {
    title?: string;
    metadesc?: string;
    focuskw?: string;
    metakeywords?: string;
  }): Promise<void> {
    const updates = [];

    for (const [key, value] of Object.entries(seoData)) {
      if (value !== undefined) {
        const metaKey = `_yoast_wpseo_${key}`;
        updates.push(
          this.pool.query(`
            INSERT INTO ${this.tablePrefix}postmeta (post_id, meta_key, meta_value)
            VALUES ($1, $2, $3)
            ON CONFLICT (post_id, meta_key) 
            DO UPDATE SET meta_value = $3
          `, [postId, metaKey, value])
        );
      }
    }

    await Promise.all(updates);
  }

  // Obtener posts sin optimización SEO
  async getPostsNeedingSEO(limit: number = 20): Promise<WordPressPost[]> {
    const query = `
      SELECT p.* 
      FROM ${this.tablePrefix}posts p
      LEFT JOIN ${this.tablePrefix}postmeta pm 
        ON p.ID = pm.post_id 
        AND pm.meta_key = '_yoast_wpseo_focuskw'
      WHERE p.post_type = 'post' 
      AND p.post_status = 'publish'
      AND (pm.meta_value IS NULL OR pm.meta_value = '')
      ORDER BY p.post_date DESC
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }

  // Obtener categorías de lesiones personales
  async getPersonalInjuryCategories(): Promise<any[]> {
    const query = `
      SELECT t.term_id, t.name, t.slug, tt.count
      FROM ${this.tablePrefix}terms t
      INNER JOIN ${this.tablePrefix}term_taxonomy tt ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'category'
      AND (
        t.name LIKE '%injury%' 
        OR t.name LIKE '%accident%' 
        OR t.name LIKE '%lawyer%'
        OR t.name LIKE '%legal%'
      )
      ORDER BY tt.count DESC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Análisis de keywords en posts existentes
  async analyzeKeywordUsage(keyword: string): Promise<any[]> {
    const query = `
      SELECT 
        p.ID,
        p.post_title,
        p.post_date,
        (LENGTH(p.post_content) - LENGTH(REPLACE(LOWER(p.post_content), LOWER($1), ''))) / LENGTH($1) as keyword_count
      FROM ${this.tablePrefix}posts p
      WHERE p.post_type = 'post'
      AND p.post_status = 'publish'
      AND LOWER(p.post_content) LIKE LOWER($2)
      ORDER BY keyword_count DESC
      LIMIT 50
    `;
    
    const result = await this.pool.query(query, [keyword, `%${keyword}%`]);
    return result.rows;
  }

  // Cerrar conexión
  async close(): Promise<void> {
    await this.pool.end();
  }

  // Test de conexión
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export default WordPressDatabase;
