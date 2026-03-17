import React, { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Video, 
  MessageSquare, 
  FileText, 
  User, 
  LogOut, 
  Plus, 
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Heart,
  Send,
  MoreVertical,
  Hand,
  Mic,
  MicOff,
  ShieldCheck,
  Star,
  Download,
  PlayCircle,
  ArrowRight,
  Settings,
  BarChart3,
  UserCheck,
  AlertCircle,
  Info,
} from 'lucide-react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDocFromServer,
  Timestamp,
  limit
} from 'firebase/firestore';
import { 
  UserProfile, 
  UserRole, 
  Post, 
  LiveClass, 
  Message, 
  Subscription, 
  LessonFile, 
  ExplainVideo, 
  Notification,
  PostComment
} from './types';

// --- Error Handling for Firestore ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.";
      try {
        if (this.state.error && this.state.error.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) errorMessage = `خطأ في قاعدة البيانات: ${parsed.error}`;
          else errorMessage = this.state.error.message;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center" dir="rtl">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">عذراً، حدث خطأ ما</h2>
          <p className="text-slate-600 mb-8 max-w-md font-medium leading-relaxed">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Components ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <img 
          src="https://picsum.photos/seed/allimni-edu/800/600" 
          alt="Educational Platform" 
          className="w-full max-w-md rounded-3xl shadow-2xl border-4 border-emerald-50"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-7xl font-black text-emerald-600 mb-2 font-sans tracking-tighter"
      >
        علّمني
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-slate-600 mb-8 font-medium"
      >
        مستقبلك يبدأ بدرس واحد
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 mb-10 max-w-lg backdrop-blur-sm"
      >
        <p className="text-slate-700 leading-relaxed text-lg">
          مرحباً بك في "علّمني"، المنصة التعليمية الأذكى في العالم العربي. نربطك بأفضل الأساتذة في دروس مباشرة وتفاعلية، مع مكتبة شاملة من الملفات والفيديوهات المصممة خصيصاً لتفوقك.
        </p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-12">
        <button 
          onClick={onFinish}
          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          ابدأ رحلة التعلم
        </button>
      </div>

      <div className="text-slate-400 text-sm font-medium">
        بواسطة فريق علّمني المبدع • 2026
      </div>
    </motion.div>
  );
};

const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isLogin) {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(user);
      } else {
        // Registration Flow
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        if (user) {
          const isMainAdmin = email === 'wahablila31000@gmail.com';
          const profileData = {
            id: user.uid,
            auth_id: user.uid,
            first_name: isMainAdmin ? 'المدير' : firstName,
            last_name: isMainAdmin ? 'العام' : lastName,
            role: isMainAdmin ? 'admin' : role,
            account_status: isMainAdmin ? 'active' : (role === 'teacher' ? 'pending' : 'active'),
            created_at: new Date().toISOString()
          };

          try {
            await setDoc(doc(db, 'users', user.uid), profileData);
          } catch (insertError) {
            console.error("Profile creation error:", insertError);
            throw new Error("تم إنشاء الحساب ولكن فشل إنشاء الملف الشخصي. يرجى التواصل مع الدعم.");
          }

          setSuccess(role === 'teacher' ? 'تم إنشاء حسابك بنجاح! بانتظار موافقة الإدارة.' : 'تم إنشاء حسابك بنجاح! جاري تحويلك...');
          
          setTimeout(() => {
            onAuthSuccess(user);
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/network-request-failed') {
        setError('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('خطأ في البريد الإلكتروني أو كلمة المرور');
      } else {
        setError(err.message || 'حدث خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await signInWithEmailAndPassword(
        auth, 
        'wahablila31000@gmail.com', 
        '123456' 
      );
      onAuthSuccess(user);
    } catch (err: any) {
      setError('فشل تسجيل الدخول التجريبي. يرجى المحاولة يدوياً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-slate-200 p-10 border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-3">
            <BookOpen className="text-white w-10 h-10 -rotate-3" />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 mb-2 text-center tracking-tight">
          {isLogin ? 'مرحباً بك!' : 'انضم إلينا'}
        </h2>
        <p className="text-slate-500 text-center mb-10 text-lg">
          {isLogin ? 'سجل دخولك لمتابعة دروسك' : 'ابدأ مسيرتك التعليمية اليوم'}
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold text-sm border border-red-100 flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-center font-bold text-sm border border-emerald-100 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {!isLogin && (
          <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'student' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}
            >
              طالب
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'teacher' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}
            >
              أستاذ
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="الاسم" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="اللقب" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          )}
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="كلمة المرور" 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {showPassword ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'جاري التحميل...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
          </button>
          
          {isLogin && (
            <button 
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all mt-2"
            >
              تجربة حساب تجريبي
            </button>
          )}
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-bold text-lg hover:underline decoration-2 underline-offset-4"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل مجاناً' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    const errorMsg = JSON.stringify(errInfo);
    console.error('Firestore Error: ', errorMsg);
    setFirebaseError(`خطأ في قاعدة البيانات (${operationType}) في ${path || 'غير معروف'}: ${errInfo.error}`);
    throw new Error(errorMsg);
  };

  const logActivity = async (action: string, details: string = '') => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, 'activity_logs'), {
        user_id: user.uid,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Activity log error:', err);
    }
  };
  
  // Data States
  const [posts, setPosts] = useState<Post[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const [explainVideos, setExplainVideos] = useState<ExplainVideo[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // UI States
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [selectedLive, setSelectedLive] = useState<LiveClass | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'video'>('file');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('الرياضيات');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState<UserProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPostForComment, setSelectedPostForComment] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState<PostComment[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isMicApproved, setIsMicApproved] = useState(false);

  useEffect(() => {
    // Verify Firebase Connection
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (err: any) {
        if (err.message.includes('the client is offline')) {
          console.error('Firebase connection error:', err);
          setFirebaseError('فشل الاتصال بقاعدة البيانات. يرجى التحقق من الإعدادات.');
        }
      }
    };
    checkConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (authId: string) => {
    console.log('Fetching profile for:', authId);
    try {
      const docRef = doc(db, 'users', authId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        console.log('Profile found:', data.role);
        setProfile(data);
        setupRealtime(data);
        fetchAllData(data);
      } else {
        console.warn('No profile document found for user:', authId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      handleFirestoreError(error, OperationType.GET, `users/${authId}`);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = (userProfile: UserProfile) => {
    // Real-time Posts
    onSnapshot(query(collection(db, 'posts'), orderBy('created_at', 'desc')), (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));

    // Real-time Live Classes
    onSnapshot(query(collection(db, 'live_classes'), orderBy('start_time', 'asc')), (snapshot) => {
      const classesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveClass));
      setLiveClasses(classesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'live_classes'));

    // Real-time Messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiver_id', '==', userProfile.auth_id),
      orderBy('created_at', 'desc')
    );
    onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(prev => {
        const combined = [...newMessages, ...prev];
        return Array.from(new Set(combined.map(m => m.id))).map(id => combined.find(m => m.id === id)!);
      });
      fetchNotifications(userProfile);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));

    // Real-time Notifications
    onSnapshot(query(collection(db, 'notifications'), where('user_id', '==', userProfile.auth_id), orderBy('created_at', 'desc')), (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notificationsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'));
  };

  const fetchAllData = (userProfile: UserProfile) => {
    // Initial fetch for non-realtime or complex data
    fetchFilesAndVideos(userProfile);
    fetchSubscriptions(userProfile);
    if (userProfile.role === 'admin') {
      fetchAdminData();
    }
  };

  const fetchNotifications = async (userProfile: UserProfile) => {
    try {
      const q = query(collection(db, 'notifications'), where('user_id', '==', userProfile.auth_id), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  };

  const fetchFilesAndVideos = async (userProfile: UserProfile) => {
    try {
      const filesSnap = await getDocs(collection(db, 'lesson_files'));
      const videosSnap = await getDocs(collection(db, 'explain_videos'));
      setLessonFiles(filesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonFile)));
      setExplainVideos(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExplainVideo)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'content');
    }
  };

  const fetchSubscriptions = async (userProfile: UserProfile) => {
    try {
      const q = query(collection(db, 'subscriptions'), where('student_id', '==', userProfile.auth_id));
      const snapshot = await getDocs(q);
      setSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'subscriptions');
    }
  };

  const fetchAdminData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const logsSnap = await getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50)));
      setAllUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
      setActivityLogs(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_data');
    }
  };

  const handleLike = async (postId: string) => {
    if (!profile) return;
    
    const post = posts.find(p => p.id === postId);
    try {
      const postRef = doc(db, 'posts', postId);
      const newLikesCount = (post?.likes_count || 0) + (post?.is_liked ? -1 : 1);
      await updateDoc(postRef, {
        likes_count: Math.max(0, newLikesCount)
      });
      // In a real app, we'd have a separate 'likes' collection to track who liked what
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleCreatePost = async () => {
    if (!profile || !newPostContent.trim()) return;
    
    try {
      await addDoc(collection(db, 'posts'), {
        author_id: profile.auth_id,
        author_name: `${profile.first_name} ${profile.last_name}`,
        author_image: profile.profile_image || null,
        content: newPostContent,
        image_url: newPostImage || null,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      });

      setNewPostContent('');
      setNewPostImage('');
      setIsPostModalOpen(false);
      
      await logActivity('نشر منشوراً جديداً', newPostContent.substring(0, 50) + '...');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const q = query(collection(db, `posts/${postId}/comments`), orderBy('created_at', 'asc'));
      const snapshot = await getDocs(q);
      setPostComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
    }
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPostForComment(post);
    setIsCommentModalOpen(true);
    fetchComments(post.id);
  };

  const handleAddComment = async () => {
    if (!profile || !selectedPostForComment || !newComment.trim()) return;

    try {
      await addDoc(collection(db, `posts/${selectedPostForComment.id}/comments`), {
        post_id: selectedPostForComment.id,
        author_id: profile.auth_id,
        author_name: `${profile.first_name} ${profile.last_name}`,
        author_image: profile.profile_image || null,
        content: newComment,
        created_at: new Date().toISOString()
      });

      // Update comment count
      const postRef = doc(db, 'posts', selectedPostForComment.id);
      await updateDoc(postRef, {
        comments_count: (selectedPostForComment.comments_count || 0) + 1
      });

      setNewComment('');
      fetchComments(selectedPostForComment.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  };

  const fetchChatMessages = async (otherUserId: string) => {
    if (!profile) return;
    try {
      // Simple query for now, complex OR queries are harder in Firestore
      const q = query(
        collection(db, 'messages'),
        where('sender_id', 'in', [profile.auth_id, otherUserId]),
        orderBy('created_at', 'asc')
      );
      const snapshot = await getDocs(q);
      // Filter client-side for the specific pair
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .filter(m => 
          (m.sender_id === profile.auth_id && m.receiver_id === otherUserId) ||
          (m.sender_id === otherUserId && m.receiver_id === profile.auth_id)
        );
      setChatMessages(msgs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    }
  };

  const handleOpenChat = (otherUser: UserProfile) => {
    setSelectedUserForChat(otherUser);
    setIsChatModalOpen(true);
    fetchChatMessages(otherUser.auth_id);
  };

  const handleSendMessage = async () => {
    if (!profile || !selectedUserForChat || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sender_id: profile.auth_id,
        sender_name: `${profile.first_name} ${profile.last_name}`,
        sender_image: profile.profile_image || null,
        receiver_id: selectedUserForChat.auth_id,
        content: newMessage,
        is_read: false,
        created_at: new Date().toISOString()
      });

      setNewMessage('');
      fetchChatMessages(selectedUserForChat.auth_id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const handleJoinLive = async (live: LiveClass) => {
    if (live.current_students >= 20) {
      setFirebaseError("عذراً، الجلسة مكتملة (الحد الأقصى 20 طالب)");
      setTimeout(() => setFirebaseError(null), 5000);
      return;
    }
    setSelectedLive(live);
    setIsLiveModalOpen(true);
    try {
      const liveRef = doc(db, 'live_classes', live.id);
      await updateDoc(liveRef, { current_students: live.current_students + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `live_classes/${live.id}`);
    }
  };

  const handleLeaveLive = async () => {
    if (selectedLive) {
      try {
        const liveRef = doc(db, 'live_classes', selectedLive.id);
        await updateDoc(liveRef, { current_students: Math.max(0, selectedLive.current_students - 1) });
      } catch (error) {
        console.error("Error leaving live:", error);
      }
    }
    setIsLiveModalOpen(false);
    setSelectedLive(null);
    setIsHandRaised(false);
    setIsMicOn(false);
  };

  const handleUploadContent = async () => {
    if (!profile || !uploadTitle.trim() || !uploadUrl.trim()) return;

    try {
      if (uploadType === 'file') {
        await addDoc(collection(db, 'lesson_files'), {
          teacher_id: profile.auth_id,
          title: uploadTitle,
          subject: uploadSubject,
          file_url: uploadUrl,
          file_type: 'pdf',
          created_at: new Date().toISOString()
        });
        await logActivity('قام برفع ملف جديد', uploadTitle);
      } else {
        await addDoc(collection(db, 'explain_videos'), {
          teacher_id: profile.auth_id,
          title: uploadTitle,
          subject: uploadSubject,
          video_url: uploadUrl,
          thumbnail_url: uploadThumbnail || null,
          created_at: new Date().toISOString()
        });
        await logActivity('قام برفع فيديو جديد', uploadTitle);
      }

      setUploadTitle('');
      setUploadUrl('');
      setUploadThumbnail('');
      setIsUploadModalOpen(false);
      fetchFilesAndVideos(profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, uploadType === 'file' ? 'lesson_files' : 'explain_videos');
    }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (!user) return <AuthScreen onAuthSuccess={(u) => setUser(u)} />;
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24" dir="rtl">
      {/* Firebase Connection Error Warning */}
      {firebaseError && (
        <div className="bg-red-600 text-white p-3 text-center text-sm font-bold sticky top-0 z-50 flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {firebaseError}
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">علّمني</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl relative transition-colors">
            <Bell className="w-6 h-6" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <ShieldCheck className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Post Creator (Teacher Only) */}
              {profile?.role === 'teacher' && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex gap-4">
                    <img 
                      src={profile.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.auth_id}`} 
                      className="w-12 h-12 rounded-2xl border-2 border-emerald-50"
                    />
                    <button 
                      onClick={() => setIsPostModalOpen(true)}
                      className="flex-1 bg-slate-50 rounded-2xl px-6 text-right text-slate-400 font-medium hover:bg-slate-100 transition-colors"
                    >
                      ماذا تريد أن تشارك مع طلابك اليوم؟
                    </button>
                  </div>
                </div>
              )}

              {/* Feed */}
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          src={post.author_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} 
                          className="w-12 h-12 rounded-2xl border-2 border-emerald-50"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{post.author_name}</h4>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <p className="text-slate-700 leading-relaxed text-lg mb-6 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                      <img 
                        src={post.image_url} 
                        className="w-full h-80 object-cover rounded-[2rem] mb-6 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors group"
                      >
                        <Heart className={`w-6 h-6 group-active:scale-125 transition-transform ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-sm font-bold">{post.likes_count || 0}</span>
                      </button>
                      <button 
                        onClick={() => handleOpenComments(post)}
                        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        <MessageSquare className="w-6 h-6" />
                        <span className="text-sm font-bold">{post.comments_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div 
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">الدروس المباشرة</h2>
                <div className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 animate-pulse">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-lg shadow-red-200"></div>
                  مباشر الآن
                </div>
              </div>

              {liveClasses.filter(l => l.status === 'live').map(live => (
                <div key={live.id} className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-bold">{live.current_students} / {live.max_students} طالب</span>
                    </div>
                    <h3 className="text-3xl font-black mb-3 tracking-tight">{live.title}</h3>
                    <p className="text-emerald-100 text-lg mb-8 font-medium">الأستاذ: {live.teacher?.first_name} {live.teacher?.last_name} • {live.subject}</p>
                    <button 
                      onClick={() => handleJoinLive(live)}
                      className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-800/20 hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      انضم للجلسة
                    </button>
                  </div>
                  <Video className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>
              ))}

              <h3 className="text-xl font-black text-slate-900 mt-10 mb-4">الدروس القادمة</h3>
              {liveClasses.filter(l => l.status === 'upcoming').map(live => (
                <div key={live.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Clock className="w-7 h-7 mb-1" />
                    <span className="text-xs font-black">{new Date(live.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{live.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{live.subject} • الأستاذ {live.teacher?.first_name}</p>
                  </div>
                  <button className="p-3 text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">الرسائل الخاصة</h2>
              
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                {messages.length > 0 ? messages.map((msg) => {
                  const isMe = msg.sender_id === profile?.auth_id;
                  const otherUserName = isMe ? 'أنت' : msg.sender_name;
                  const otherUserImage = isMe ? profile?.profile_image : msg.sender_image;
                  
                  return (
                    <button 
                      key={msg.id} 
                      onClick={() => {
                        // In a real app, we'd find the other user object
                        // For now, we'll just open the chat with what we have
                        if (!isMe) {
                          setSelectedUserForChat({ auth_id: msg.sender_id, first_name: msg.sender_name?.split(' ')[0] || '', last_name: msg.sender_name?.split(' ')[1] || '', profile_image: msg.sender_image } as UserProfile);
                          setIsChatModalOpen(true);
                          fetchChatMessages(msg.sender_id);
                        }
                      }}
                      className="w-full p-6 flex items-center gap-5 hover:bg-slate-50 transition-all text-right group"
                    >
                      <div className="relative">
                        <img 
                          src={otherUserImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} 
                          className="w-16 h-16 rounded-[1.5rem] border-2 border-emerald-50 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <h4 className="font-black text-slate-900 text-lg">{otherUserName}</h4>
                          <span className="text-xs text-slate-400 font-bold">{new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-500 truncate font-medium">{msg.content}</p>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="p-20 text-center">
                    <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">لا توجد رسائل حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div 
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">المكتبة التعليمية</h2>
                <div className="flex gap-2">
                  {profile?.role === 'teacher' && (
                    <button 
                      onClick={() => setIsUploadModalOpen(true)}
                      className="p-3 bg-emerald-600 text-white shadow-lg shadow-emerald-100 rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-sm font-bold">رفع محتوى</span>
                    </button>
                  )}
                  <button className="p-3 bg-white shadow-sm border border-slate-100 text-emerald-600 rounded-2xl hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Subjects Grid */}
              <div className="grid grid-cols-2 gap-4">
                {['الرياضيات', 'الفيزياء', 'العلوم', 'الأدب'].map((subject) => (
                  <div key={subject} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center hover:shadow-xl hover:shadow-emerald-100/20 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                      <FileText className="text-emerald-600 w-8 h-8 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">{subject}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">24 ملف متاح</p>
                  </div>
                ))}
              </div>

              {/* Videos Section */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <PlayCircle className="text-emerald-600 w-6 h-6" />
                  فيديوهات توضيحية قصيرة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {explainVideos.map(video => (
                    <div key={video.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group">
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="relative h-48 bg-slate-900 block">
                        <img src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/400/300`} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-500">
                            <PlayCircle className="text-white w-10 h-10" />
                          </div>
                        </div>
                      </a>
                      <div className="p-5">
                        <h4 className="font-bold text-slate-900 mb-1">{video.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{video.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Files List */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Download className="text-emerald-600 w-6 h-6" />
                  أحدث الملفات
                </h3>
                <div className="space-y-4">
                  {lessonFiles.map(file => (
                    <div key={file.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 font-black text-xs">
                        PDF
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">{file.title}</h4>
                        <p className="text-xs text-slate-400 font-bold">{file.subject} • 2.4 MB</p>
                      </div>
                      <a 
                        href={file.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                      >
                        <Download className="w-6 h-6" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload & Organization Instructions */}
              <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
                <h3 className="text-xl font-black text-emerald-900 mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6" />
                  كيفية رفع وتنظيم الملفات
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="font-black text-emerald-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-1">اختيار المادة المناسبة</h4>
                      <p className="text-sm text-emerald-700/70 leading-relaxed">تأكد من اختيار القسم الصحيح للمادة الدراسية (رياضيات، فيزياء، إلخ) لسهولة وصول الطلاب إليها.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="font-black text-emerald-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-1">تسمية الملف بوضوح</h4>
                      <p className="text-sm text-emerald-700/70 leading-relaxed">استخدم أسماء واضحة مثل "ملخص الفصل الأول - الميكانيكا" بدلاً من أسماء عشوائية.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="font-black text-emerald-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-1">صيغة الملفات</h4>
                      <p className="text-sm text-emerald-700/70 leading-relaxed">نوصي باستخدام صيغة PDF للمستندات لضمان توافقها مع جميع الأجهزة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[3rem] p-10 text-center shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-emerald-600/5"></div>
                <div className="relative inline-block mb-6">
                  <img 
                    src={profile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} 
                    className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-2xl relative z-10"
                  />
                  <button className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-xl z-20 hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{profile?.first_name} {profile?.last_name}</h2>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    {profile?.role === 'student' ? 'طالب متميز' : 'أستاذ معتمد'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-6 border-t border-slate-50 pt-8">
                  <div>
                    <p className="text-2xl font-black text-slate-900">12</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">دروس</p>
                  </div>
                  <div className="border-x border-slate-50">
                    <p className="text-2xl font-black text-slate-900">450</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">نقاط</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">8</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">أوسمة</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-emerald-600 transition-all duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Settings className="text-slate-400 group-hover:text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-white text-lg">إعدادات الحساب</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-white w-6 h-6" />
                </button>
                
                <button 
                  onClick={async () => {
                    await auth.signOut();
                    setUser(null);
                    setProfile(null);
                  }}
                  className="w-full bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center justify-between group hover:bg-red-600 transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                      <LogOut className="text-red-600 w-6 h-6" />
                    </div>
                    <span className="font-bold text-red-600 group-hover:text-white text-lg">تسجيل الخروج</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">لوحة الإدارة</h2>
                <div className="flex gap-2">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <BarChart3 className="text-emerald-600 w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase mb-2">إجمالي الطلاب</p>
                  <h3 className="text-3xl font-black text-slate-900">{allUsers.filter(u => u.role === 'student').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase mb-2">إجمالي الأساتذة</p>
                  <h3 className="text-3xl font-black text-slate-900">{allUsers.filter(u => u.role === 'teacher').length}</h3>
                </div>
              </div>

              {/* Approvals Section */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <UserCheck className="text-emerald-600 w-6 h-6" />
                    طلبات انضمام الأساتذة
                  </h3>
                  <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {allUsers.filter(u => u.role === 'teacher' && u.account_status === 'pending').length} طلب معلق
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {allUsers.filter(u => u.role === 'teacher' && u.account_status === 'pending').map((u) => (
                    <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={u.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-emerald-50" />
                        <div>
                          <h4 className="font-bold text-slate-900">{u.first_name} {u.last_name}</h4>
                          <p className="text-xs text-slate-500 font-medium">مادة العلوم الطبيعية</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">قبول</button>
                        <button className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-red-100 transition-all">رفض</button>
                      </div>
                    </div>
                  ))}
                  {allUsers.filter(u => u.role === 'teacher' && u.account_status === 'pending').length === 0 && (
                    <div className="p-10 text-center text-slate-400 font-bold">لا توجد طلبات معلقة</div>
                  )}
                </div>
              </div>

              {/* Activity Logs */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Clock className="text-emerald-600 w-6 h-6" />
                  سجل النشاطات الأخير
                </h3>
                <div className="space-y-6">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 group">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2.5 shadow-lg shadow-emerald-200 group-hover:scale-150 transition-transform"></div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-bold text-sm">
                          <span className="text-emerald-600">{log.user_name}</span> {log.action}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-1">{log.details}</p>
                        <p className="text-[10px] text-slate-300 font-black uppercase mt-1.5 tracking-tighter">
                          {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO Hidden Section for Crawlers */}
        <section className="sr-only" aria-hidden="true">
          <h2>علّمني - المنصة التعليمية الأولى في الجزائر</h2>
          <p>
            موقع علّمني هو منصة تعليمية جزائرية متخصصة في تقديم دروس تدعيمية لطلاب البكالوريا (BAC) وشهادة التعليم المتوسط (BEM). 
            نوفر ملخصات دروس في الرياضيات، الفيزياء، العلوم الطبيعية، الأدب العربي، واللغات الأجنبية. 
            تواصل مع أفضل الأساتذة في الجزائر من خلال البث المباشر والرسائل. 
            تحميل ملفات PDF مجانية، فيديوهات تعليمية قصيرة، وتمارين محلولة. 
            مراجعة نهائية للبكالوريا 2026، دروس السنة الثالثة ثانوي، مراجعة شهادة التعليم المتوسط 2026.
          </p>
          <ul>
            <li>دروس خصوصية الجزائر</li>
            <li>ملخصات بكالوريا 2026</li>
            <li>أفضل الأساتذة في الجزائر</li>
            <li>تعليم عن بعد الجزائر</li>
            <li>موقع قرايتي الجزائر</li>
            <li>دروس السنة الرابعة متوسط</li>
            <li>تحضير البكالوريا الجزائر</li>
          </ul>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex items-center justify-between z-40 shadow-2xl shadow-slate-900/10">
        {[
          { id: 'home', icon: Home, label: 'الرئيسية' },
          { id: 'live', icon: Video, label: 'مباشر' },
          { id: 'messages', icon: MessageSquare, label: 'رسائل' },
          { id: 'files', icon: FileText, label: 'مكتبة' },
          { id: 'profile', icon: User, label: 'حسابي' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon className={`w-7 h-7 ${activeTab === tab.id ? 'fill-emerald-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -top-4 w-12 h-1.5 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Live Class Modal */}
      <AnimatePresence>
        {isLiveModalOpen && selectedLive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLeaveLive}
                  className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div>
                  <h3 className="text-white font-black text-lg">{selectedLive.title}</h3>
                  <p className="text-slate-400 text-xs font-bold">الأستاذ {selectedLive.teacher?.first_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black animate-pulse">LIVE</div>
                <div className="text-white/60 text-xs font-bold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {selectedLive.current_students}
                </div>
              </div>
            </div>

            {/* Video Area (Simulated) */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <img src="https://picsum.photos/seed/live-bg/1200/800" className="w-full h-full object-cover blur-3xl" />
              </div>
              
              {/* Teacher View */}
              <div className="relative z-10 w-full max-w-4xl aspect-video bg-slate-800 rounded-[3rem] shadow-2xl border-4 border-white/5 flex items-center justify-center overflow-hidden group">
                <img src={selectedLive.teacher?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLive.teacher_id}`} className="w-48 h-48 rounded-full border-8 border-emerald-500/20" />
                <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <p className="text-white font-black text-lg">الأستاذ {selectedLive.teacher?.first_name} {selectedLive.teacher?.last_name}</p>
                </div>
                <div className="absolute top-8 right-8 flex gap-2">
                  <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg">
                    <Mic className="text-white w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Floating Hand Notification */}
              <AnimatePresence>
                {isHandRaised && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 z-30 border-4 border-white/20"
                  >
                    <Hand className="w-8 h-8 animate-bounce" />
                    <span className="text-xl font-black">لقد رفعت يدك!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="p-8 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-6">
              <button 
                onClick={() => setIsHandRaised(!isHandRaised)}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${isHandRaised ? 'bg-amber-500 text-white scale-110 rotate-12' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                <Hand className="w-10 h-10" />
              </button>
              
              <button 
                disabled={!isMicApproved}
                onClick={() => setIsMicOn(!isMicOn)}
                className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${!isMicApproved ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : isMicOn ? 'bg-emerald-500 text-white scale-110' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {isMicOn ? <Mic className="w-12 h-12" /> : <MicOff className="w-12 h-12" />}
              </button>

              <button 
                onClick={handleLeaveLive}
                className="w-20 h-20 bg-red-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-500/20 hover:bg-red-600 hover:scale-110 transition-all"
              >
                <LogOut className="w-10 h-10" />
              </button>
            </div>

            {/* Mic Approval Simulation for Demo */}
            {isHandRaised && !isMicApproved && (
              <div className="absolute bottom-36 left-1/2 -translate-x-1/2">
                <button 
                  onClick={() => setIsMicApproved(true)}
                  className="bg-white/10 backdrop-blur-md text-white/40 text-[10px] px-4 py-2 rounded-full hover:text-white transition-colors"
                >
                  (محاكاة: الأستاذ يوافق على المايك)
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">رفع محتوى جديد</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => setUploadType('file')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'file' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}
                  >
                    ملف (PDF)
                  </button>
                  <button 
                    onClick={() => setUploadType('video')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'video' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}
                  >
                    فيديو توضيحي
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">العنوان</label>
                    <input 
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="مثال: ملخص الفصل الأول"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">المادة</label>
                    <select 
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      {['الرياضيات', 'الفيزياء', 'العلوم', 'الأدب', 'اللغات'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">رابط {uploadType === 'file' ? 'الملف' : 'الفيديو'}</label>
                    <input 
                      type="text"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      placeholder="https://example.com/resource"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {uploadType === 'video' && (
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">رابط الصورة المصغرة (اختياري)</label>
                      <input 
                        type="text"
                        value={uploadThumbnail}
                        onChange={(e) => setUploadThumbnail(e.target.value)}
                        placeholder="https://example.com/thumb.jpg"
                        className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleUploadContent}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  تأكيد الرفع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">إنشاء منشور جديد</h3>
                <button onClick={() => setIsPostModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="اكتب محتوى المنشور هنا..."
                  className="w-full h-40 bg-slate-50 rounded-2xl p-6 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">رابط الصورة (اختياري)</label>
                  <input 
                    type="text"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handleCreatePost}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  نشر الآن
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {isCommentModalOpen && selectedPostForComment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">التعليقات</h3>
                <button onClick={() => setIsCommentModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {postComments.length > 0 ? postComments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <img 
                      src={comment.author_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_id}`} 
                      className="w-10 h-10 rounded-xl border border-slate-100"
                    />
                    <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="font-bold text-slate-900 text-sm">{comment.author_name}</h5>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(comment.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-slate-400 font-bold">لا توجد تعليقات بعد. كن أول من يعلق!</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <input 
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  className="flex-1 bg-white rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button 
                  onClick={handleAddComment}
                  className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatModalOpen && selectedUserForChat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsChatModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                </button>
                <div className="flex items-center gap-3">
                  <img src={selectedUserForChat.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserForChat.id}`} className="w-10 h-10 rounded-xl" />
                  <div>
                    <h3 className="font-black text-slate-900">{selectedUserForChat.first_name} {selectedUserForChat.last_name}</h3>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">نشط الآن</p>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === profile?.id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender_id === profile?.id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                    <p className="font-medium leading-relaxed">{msg.content}</p>
                    <p className={`text-[9px] mt-1 font-bold uppercase ${msg.sender_id === profile?.id ? 'text-emerald-100' : 'text-slate-300'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
              <button className="p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                <Plus className="w-6 h-6" />
              </button>
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
