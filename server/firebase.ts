
import admin from 'firebase-admin';

// Lee las credenciales del archivo de cuenta de servicio
// Asegúrate de que el archivo 'firebase-service-account.json' se encuentre en el directorio raíz del proyecto
try {
  const serviceAccount = require('../../firebase-service-account.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Opcional: añade la URL de tu base de datos si usas Realtime Database
      // databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com'
    });
  } else {
    admin.app(); // Si ya está inicializada, simplemente obtén la app
  }

  console.log('Firebase Admin SDK inicializado correctamente.');

} catch (error: any) {
  console.error('Error al inicializar Firebase Admin SDK:', error.message);
  console.error('Asegúrate de tener un archivo firebase-service-account.json válido en la raíz del proyecto.');
  // En un entorno de producción, podrías querer que la aplicación falle si Firebase no se puede inicializar
  // process.exit(1);
}

// Exporta la instancia de Firestore para usarla en otros archivos
export const firestore = admin.firestore();
export const auth = admin.auth();
