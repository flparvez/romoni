import 'next-auth';
import 'next-auth/jwt';

// next-auth/jwt মডিউলটি এক্সটেন্ড করে টোকেনে role যোগ করা হচ্ছে
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

// next-auth মডিউলটি এক্সটেন্ড করে session.user-এ role এবং id যোগ করা হচ্ছে
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
    };
  }

  interface User {
    role: string;
  }
}