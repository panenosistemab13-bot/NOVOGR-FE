import React from 'react';

export default function CinematicLogisticPanel() {
  return (
    <div className="w-full h-full relative bg-[#33291B] text-[#F5EFE4] flex flex-col justify-end p-8 overflow-hidden">
        {/* Background Cinematic Visual */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542382257-809973801267?q=80&w=1600)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#33291B]/90 via-[#33291B]/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black uppercase text-[#DDB76B]">LOGÍSTICA QUE APROXIMA</h2>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-[#FFF9EF]/10 p-4 rounded-2xl border border-[#DDB76B]/30 backdrop-blur-md">
                    <p className="text-2xl font-black">98%</p>
                    <p className="text-[10px] uppercase font-bold text-[#DDB76B]">SEGURANÇA</p>
                </div>
                <div className="bg-[#FFF9EF]/10 p-4 rounded-2xl border border-[#DDB76B]/30 backdrop-blur-md">
                    <p className="text-2xl font-black">95%</p>
                    <p className="text-[10px] uppercase font-bold text-[#DDB76B]">EFICIÊNCIA</p>
                </div>
                <div className="bg-[#FFF9EF]/10 p-4 rounded-2xl border border-[#DDB76B]/30 backdrop-blur-md">
                    <p className="text-2xl font-black">1.2k</p>
                    <p className="text-[10px] uppercase font-bold text-[#DDB76B]">PESSOAS</p>
                </div>
            </div>
            
            <div className="mt-6 border-t border-[#DDB76B]/30 pt-4">
                <p className="text-xs font-semibold text-[#EEE2CD]">Mapa Logístico BR - Destaque MG</p>
            </div>
        </div>
    </div>
  );
}
