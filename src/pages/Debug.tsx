import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Debug = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Site Settings yoxlanışı
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('*');
        
      if (settingsError) setError(settingsError);
      else setData(settings);
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Debug Panel</h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-100 dark:bg-gray-800">
        <h2 className="font-bold mb-2">Status:</h2>
        {loading ? "Yüklənir..." : error ? "XƏTA VAR" : "Sorğu Uğurlu"}
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 text-red-900 rounded">
          <h2 className="font-bold">Xəta Mesajı:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
          <p className="mt-2 font-bold">Həlli:</p>
          <p>Əgər xəta RLS ilə bağlıdırsa (permission denied), zəhmət olmasa FIX_PERMISSIONS.sql faylını Supabase SQL Editor-da işlədin.</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-bold mb-2">Gələn Məlumat (site_settings):</h2>
        {data && data.length === 0 && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
            Bazadan boş siyahı [] qayıtdı. Bu o deməkdir ki, cədvəldə məlumat var, amma RLS (Təhlükəsizlik) onu oxumağa icazə vermir.
            <br/>
            <strong>Həlli:</strong> FIX_PERMISSIONS.sql faylını işlədin.
          </div>
        )}
        <pre className="p-4 bg-gray-900 text-green-400 rounded overflow-auto max-h-[500px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Debug;