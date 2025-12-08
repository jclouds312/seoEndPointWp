import { storage } from "./storage";

const EXAMPLE_CAMPAIGNS = [
  {
    name: "Abogados de Lesiones Personales - California",
    blogUrl: "https://www.californiapersonalinjurylawyersblog.com",
    description: "Campaña principal SEO para el nicho de lesiones personales en California. Enfocada en accidentes automovilísticos, negligencia médica y compensación laboral.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "abogado lesiones, accidentes, compensación",
      targetAudience: "Víctimas de accidentes en California"
    }
  },
  {
    name: "Abogados de Accidentes - Texas",
    blogUrl: "https://texasaccidentlawyers.com",
    description: "Expansión de campaña para el área de Houston. Especializada en accidentes de construcción, camiones y lesiones laborales.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "accidentes texas, lesiones laborales, compensación",
      targetAudience: "Trabajadores y víctimas en Texas"
    }
  },
  {
    name: "Derecho de Familia - Florida",
    blogUrl: "https://floridafamilylaw.com",
    description: "Recursos legales para casos de divorcio, custodia y manutención infantil en Florida.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "divorcio, custodia, manutención",
      targetAudience: "Familias en proceso de divorcio"
    }
  },
  {
    name: "Negligencia Médica - Nueva York",
    blogUrl: "https://nymedicalmalpractice.com",
    description: "Insights de expertos sobre casos de negligencia médica y errores hospitalarios.",
    userId: "default-user",
    config: { 
      niche: "Médico-Legal", 
      language: "Español",
      keywords: "negligencia médica, errores médicos, mala praxis",
      targetAudience: "Víctimas de negligencia médica"
    }
  },
  {
    name: "Derecho Penal - Los Ángeles",
    blogUrl: "https://lacriminaldefense.com",
    description: "Defensa criminal en Los Ángeles. Casos de DUI, asalto y delitos menores.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "defensa criminal, DUI, abogado penal",
      targetAudience: "Personas acusadas de delitos"
    }
  },
  {
    name: "Inmigración - Miami",
    blogUrl: "https://miamiimmigrationhelp.com",
    description: "Asistencia legal para visa, ciudadanía y casos de deportación en Miami.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "inmigración, visa, ciudadanía",
      targetAudience: "Inmigrantes en proceso de legalización"
    }
  },
  {
    name: "Bancarrota - Arizona",
    blogUrl: "https://arizonabankruptcylaw.com",
    description: "Guía completa sobre bancarrota personal y empresarial en Arizona.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "bancarrota, quiebra, deudas",
      targetAudience: "Personas con problemas financieros"
    }
  },
  {
    name: "Compensación Laboral - Illinois",
    blogUrl: "https://illinoisworkerscomp.com",
    description: "Recursos para trabajadores lesionados que buscan compensación laboral.",
    userId: "default-user",
    config: { 
      niche: "Legal", 
      language: "Español",
      keywords: "compensación laboral, lesiones trabajo",
      targetAudience: "Trabajadores lesionados"
    }
  }
];

function generateEmbedCode(blogIdentifier: string): string {
  return `<?php
/**
 * Plugin Name: SEO Automation Hub - ${blogIdentifier}
 * Description: Embeds the Replit SEO Dashboard into WordPress Admin
 * Version: 2.0.0
 * Author: SEO Hub
 */

add_action('admin_menu', 'register_seo_hub_${blogIdentifier}');

function register_seo_hub_${blogIdentifier}() {
    add_menu_page(
        'SEO Automation',
        'SEO Hub',
        'manage_options',
        'seo-automation-hub-${blogIdentifier}',
        'render_seo_hub_${blogIdentifier}',
        'dashicons-chart-area',
        6
    );
}

function render_seo_hub_${blogIdentifier}() {
    ?>
    <div class="wrap" style="background: #fff; margin: 0; padding: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        <iframe 
            src="https://[YOUR-REPLIT-URL].replit.app/?campaign=${blogIdentifier}" 
            style="width: 100%; height: 100vh; border: none;"
            title="SEO Automation Hub"
        ></iframe>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const wrap = document.querySelector('.wrap');
            if(wrap) {
                wrap.closest('#wpbody-content').style.padding = '0';
            }
        });
    </script>
    <?php
}
?>`;
}

async function seedCampaigns() {
  try {
    console.log('🌱 Starting campaign seeding...\n');

    // Ensure default user exists
    let user = await storage.getUser("default-user");
    if (!user) {
      console.log('Creating default user...');
      user = await storage.createUser({
        username: 'default-user',
        password: 'default-pass',
        email: 'admin@example.com'
      });
      console.log('✓ Default user created\n');
    }

    // Create campaigns
    for (const campaignData of EXAMPLE_CAMPAIGNS) {
      const blogIdentifier = campaignData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const embedCode = generateEmbedCode(blogIdentifier);

      try {
        const campaign = await storage.createCampaign({
          ...campaignData,
          embedCode,
          status: 'active',
          posts: Math.floor(Math.random() * 150) + 10 // Random posts between 10-160
        });

        console.log(`✓ Created campaign: ${campaign.name}`);
        console.log(`  URL: ${campaign.blogUrl}`);
        console.log(`  Posts: ${campaign.posts}`);
        console.log('');
      } catch (error: any) {
        console.error(`✗ Error creating campaign "${campaignData.name}":`, error.message);
      }
    }

    console.log('🎉 Campaign seeding completed!\n');
    console.log('Run your application and navigate to /campaigns to see the results.');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedCampaigns();