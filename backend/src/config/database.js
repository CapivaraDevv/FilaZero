

import mongoose from 'mongoose';


export async function connectDatabase() {
  try {
  
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/filazero';
    
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB');

  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
}


export default mongoose;
