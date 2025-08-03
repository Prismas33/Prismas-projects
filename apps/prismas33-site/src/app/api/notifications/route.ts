import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    console.log('🔍 API: Buscando notificações na coleção admin_notifications...');
    
    const notificationsRef = adminDb.collection('admin_notifications');
    const snapshot = await notificationsRef.orderBy('createdAt', 'desc').get();
    
    console.log('📊 API: Documentos encontrados:', snapshot.size);
    
    const notifications = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        timestamp: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
      };
    });
    
    console.log('✅ API: Notificações processadas:', notifications.length);
    
    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao buscar notificações:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
