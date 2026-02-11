import mongoose from 'mongoose';

const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'dry_fruit_shop_db',
    });

    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', conn.connection.name);
    console.log('🌍 Host:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection Error:', error.message);
    process.exit(1);
  }
};

export default dbConnection;
