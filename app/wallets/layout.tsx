import { AuthGuard } from '@/components/shared/AuthGuard';
import React from 'react';


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {


    return (
      <div className='w-full flex justify-center'>
     
            <AuthGuard>{children} </AuthGuard></div>
    
    );
};

export default Layout;