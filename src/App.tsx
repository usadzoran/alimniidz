import React, { useState, useEffect } from 'react';
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
  Layout,
  LogIn,
  UserPlus
} from 'lucide-react';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  where,
  updateDoc,
  getDocs,
  getDocFromServer,
  limit
} from 'firebase/firestore';

// --- Types ---
type Role = 'student' | 'teacher' | 'admin';
type AccountStatus = 'pending' | 'approved' | 'rejected';

interface UserProfile {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  account_status: AccountStatus;
  profile_image?: string;
  created_at: any;
}

interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_image?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: any;
  is_liked?: boolean;
}

interface LiveClass {
  id: string;
  title: string;
  teacher_id: string;
  subject: string;
  start_time: any;
  status: 'upcoming' | 'live' | 'ended';
  max_students: number;
  current_students: number;
  teacher?: UserProfile;
}

interface LessonFile {
  id: string;
  title: string;
  subject: string;
  file_url: string;
  uploaded_by: string;
  created_at: any;
}

interface ExplainVideo {
  id: string;
  title: string;
  subject: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: any;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  sender_image?: string;
  content: string;
  created_at: any;
}

// --- Components ---

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Caught error:", error);
      setHasError(true);
      setErrorMsg(error.message);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">عذراً، حدث خطأ ما</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            إعادة تحميل الصفحة
          </button>
          {errorMsg && <p className="mt-4 text-[10px] text-slate-300 font-mono">{errorMsg}</p>}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const logActivity = async (action: string, details: string, userProfile?: UserProfile | null) => {
    const currentProfile = userProfile || profile;
    if (!currentProfile) return;
    try {
      await addDoc(collection(db, 'activity_logs'), {
        user_id: currentProfile.auth_id,
        user_name: `${currentProfile.first_name} ${currentProfile.last_name}`,
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  // Auth & Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("Auth state changed:", authUser?.email);
      setUser(authUser);
      if (authUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (profileDoc.exists()) {
            const p = { id: profileDoc.id, ...profileDoc.data() } as UserProfile;
            setProfile(p);
            logActivity('سجل دخول', 'من المتصفح', p);
          } else {
            console.warn("No profile found for user:", authUser.uid);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          setFirebaseError("يرجى التحقق من إعدادات Firebase. العميل غير متصل.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">جاري التحميل...</h1>
        </div>
      </div>
    );
  }

  if (firebaseError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">خطأ في الاتصال</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">{firebaseError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <PublicArea />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
        {profile?.role === 'admin' ? (
          <AdminArea profile={profile} adminTab={adminTab} setAdminTab={setAdminTab} logActivity={logActivity} />
        ) : (
          <MainApp profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} logActivity={logActivity} />
        )}
      </div>
    </ErrorBoundary>
  );
}

// --- Public Area ---

function PublicArea() {
  const [view, setView] = useState<'splash' | 'login' | 'signup_student' | 'signup_teacher'>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent, role: Role) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        auth_id: user.uid,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
        account_status: role === 'teacher' ? 'pending' : 'approved',
        created_at: serverTimestamp()
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <BookOpen className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">علّمني</h1>
          <p className="text-emerald-100 text-xl font-medium max-w-xs mx-auto">المنصة التعليمية الأولى في الجزائر</p>
        </motion.div>

        <div className="space-y-4 w-full max-w-xs">
          <button 
            onClick={() => setView('login')}
            className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
          >
            <LogIn className="w-6 h-6" />
            تسجيل الدخول
          </button>
          <button 
            onClick={() => setView('signup_student')}
            className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-3"
          >
            <UserPlus className="w-6 h-6" />
            حساب طالب جديد
          </button>
          <button 
            onClick={() => setView('signup_teacher')}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6" />
            حساب أستاذ جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md w-full">
        <button onClick={() => setView('splash')} className="mb-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-colors">
          <ArrowRight className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-slate-900 mb-2">
          {view === 'login' ? 'مرحباً بك مجدداً' : view === 'signup_student' ? 'إنشاء حساب طالب' : 'إنشاء حساب أستاذ'}
        </h2>
        <p className="text-slate-500 mb-8 font-medium">يرجى إدخال بياناتك للمتابعة</p>

        <form onSubmit={(e) => view === 'login' ? handleLogin(e) : handleSignup(e, view === 'signup_student' ? 'student' : 'teacher')} className="space-y-4">
          {(view === 'signup_student' || view === 'signup_teacher') && (
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="الاسم" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input 
                type="text" 
                placeholder="اللقب" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {loading ? 'جاري المعالجة...' : view === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          {view === 'login' ? (
            <>ليس لديك حساب؟ <button onClick={() => setView('signup_student')} className="text-emerald-600 font-black">سجل الآن</button></>
          ) : (
            <>لديك حساب بالفعل؟ <button onClick={() => setView('login')} className="text-emerald-600 font-black">سجل دخولك</button></>
          )}
        </p>
      </div>
    </div>
  );
}

// --- Main App (Student & Teacher) ---

function MainApp({ profile, activeTab, setActiveTab, logActivity }: { profile: UserProfile | null, activeTab: string, setActiveTab: (t: string) => void, logActivity: (a: string, d: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const [explainVideos, setExplainVideos] = useState<ExplainVideo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedLive, setSelectedLive] = useState<LiveClass | null>(null);
  const [selectedUserForChat, setSelectedUserForChat] = useState<UserProfile | null>(null);
  const [postContent, setPostContent] = useState('');
  const [liveTitle, setLiveTitle] = useState('');
  const [liveSubject, setLiveSubject] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isMicApproved, setIsMicApproved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Posts
    const qPosts = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });

    // Fetch Live Classes
    const qLive = query(collection(db, 'live_classes'), where('status', 'in', ['upcoming', 'live']));
    const unsubLive = onSnapshot(qLive, (snap) => {
      setLiveClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveClass)));
    });

    // Fetch Files
    const qFiles = query(collection(db, 'lesson_files'), orderBy('created_at', 'desc'));
    const unsubFiles = onSnapshot(qFiles, (snap) => {
      setLessonFiles(snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonFile)));
    });

    // Fetch Videos
    const qVideos = query(collection(db, 'explain_videos'), orderBy('created_at', 'desc'));
    const unsubVideos = onSnapshot(qVideos, (snap) => {
      setExplainVideos(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExplainVideo)));
    });

    // Fetch Messages
    if (profile) {
      const qMsgs = query(
        collection(db, 'messages'), 
        where('receiver_id', '==', profile.auth_id),
        orderBy('created_at', 'desc')
      );
      const unsubMsgs = onSnapshot(qMsgs, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      });
      return () => { unsubPosts(); unsubLive(); unsubFiles(); unsubVideos(); unsubMsgs(); };
    }

    return () => { unsubPosts(); unsubLive(); unsubFiles(); unsubVideos(); };
  }, [profile]);

  const handleLike = async (postId: string) => {
    if (!profile) return;
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (post) {
      await updateDoc(postRef, {
        likes_count: (post.likes_count || 0) + 1
      });
      logActivity('أعجب بمنشور', `منشور: ${post.content.substring(0, 20)}...`);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !profile) return;
    await addDoc(collection(db, 'posts'), {
      author_id: profile.auth_id,
      author_name: `${profile.first_name} ${profile.last_name}`,
      author_image: profile.profile_image || null,
      content: postContent,
      likes_count: 0,
      comments_count: 0,
      created_at: serverTimestamp()
    });
    logActivity('أنشأ منشوراً', postContent.substring(0, 30));
    setPostContent('');
    setIsPostModalOpen(false);
  };

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'video'>('file');

  const handleUpload = async () => {
    if (!uploadTitle || !uploadSubject || !profile) return;
    
    if (uploadType === 'file') {
      await addDoc(collection(db, 'lesson_files'), {
        title: uploadTitle,
        subject: uploadSubject,
        file_url: 'https://example.com/demo-file.pdf', // In a real app, this would be from Firebase Storage
        uploaded_by: profile.auth_id,
        created_at: serverTimestamp()
      });
      logActivity('رفع ملفاً تعليمياً', `${uploadTitle} (${uploadSubject})`);
    } else {
      await addDoc(collection(db, 'explain_videos'), {
        title: uploadTitle,
        subject: uploadSubject,
        video_url: 'https://example.com/demo-video.mp4',
        thumbnail_url: `https://picsum.photos/seed/${Math.random()}/400/300`,
        created_at: serverTimestamp()
      });
      logActivity('رفع فيديو توضيحي', `${uploadTitle} (${uploadSubject})`);
    }
    
    setUploadTitle('');
    setUploadSubject('');
    setIsUploadModalOpen(false);
  };

  const handleCreateLive = async () => {
    if (!liveTitle.trim() || !profile) return;
    await addDoc(collection(db, 'live_classes'), {
      title: liveTitle,
      teacher_id: profile.auth_id,
      subject: liveSubject,
      start_time: serverTimestamp(),
      status: 'upcoming',
      max_students: 50,
      current_students: 0
    });
    logActivity('جدول حصة مباشرة', `${liveTitle} (${liveSubject})`);
    setLiveTitle('');
    setLiveSubject('');
    setIsLiveModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile || !selectedUserForChat) return;
    await addDoc(collection(db, 'messages'), {
      sender_id: profile.auth_id,
      receiver_id: selectedUserForChat.auth_id,
      sender_name: `${profile.first_name} ${profile.last_name}`,
      sender_image: profile.profile_image || null,
      content: newMessage,
      created_at: serverTimestamp()
    });
    logActivity('أرسل رسالة', `إلى ${selectedUserForChat.first_name}`);
    setNewMessage('');
  };

  const fetchChatMessages = (otherUserId: string) => {
    if (!profile) return;
    const q = query(
      collection(db, 'messages'),
      where('sender_id', 'in', [profile.auth_id, otherUserId]),
      where('receiver_id', 'in', [profile.auth_id, otherUserId]),
      orderBy('created_at', 'asc')
    );
    return onSnapshot(q, (snap) => {
      setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  };

  const handleJoinLive = (live: LiveClass) => {
    setSelectedLive(live);
    setIsLiveModalOpen(true);
    // In a real app, we'd increment current_students
  };

  const handleLeaveLive = () => {
    setIsLiveModalOpen(false);
    setSelectedLive(null);
    setIsHandRaised(false);
    setIsMicOn(false);
    setIsMicApproved(false);
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPostForComments(post);
    // Fetch comments logic here
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !profile || !selectedPostForComments) return;
    // Add comment logic here
    setNewComment('');
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <BookOpen className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">علّمني</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
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
                          {post.created_at?.toDate().toLocaleDateString('ar-EG')}
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
                    <p className="text-emerald-100 text-lg mb-8 font-medium">{live.subject}</p>
                    <button 
                      onClick={() => { setSelectedLive(live); setIsLiveModalOpen(true); }}
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
                    <span className="text-xs font-black">{live.start_time?.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{live.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{live.subject}</p>
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
                          <span className="text-xs text-slate-400 font-bold">{msg.created_at?.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
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
                {['الرياضيات', 'الفيزياء', 'العلوم', 'الأدب'].map((subject) => {
                  const subjectFiles = lessonFiles.filter(f => f.subject === subject).length;
                  return (
                    <div key={subject} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center hover:shadow-xl hover:shadow-emerald-100/20 transition-all cursor-pointer group">
                      <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                        <FileText className="text-emerald-600 w-8 h-8 group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="font-black text-slate-900 text-lg mb-1">{subject}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{subjectFiles} ملف متاح</p>
                    </div>
                  );
                })}
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
                      <div className="relative h-48 bg-slate-900">
                        <img src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/400/300`} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-500">
                            <PlayCircle className="text-white w-10 h-10" />
                          </div>
                        </div>
                      </div>
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
                      <button className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all">
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                  ))}
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
                    src={profile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.auth_id}`} 
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
                    <p className="text-2xl font-black text-slate-900">
                      {profile?.role === 'teacher' ? lessonFiles.filter(f => f.uploaded_by === profile.auth_id).length : posts.filter(p => p.author_id === profile?.auth_id).length}
                    </p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">{profile?.role === 'teacher' ? 'ملفات' : 'منشورات'}</p>
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
                  onClick={() => signOut(auth)}
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
        </AnimatePresence>
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

      {/* Modals */}
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

        {isUploadModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">رفع محتوى تعليمي</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="عنوان المحتوى"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <select 
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">اختر المادة</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="الفيزياء">الفيزياء</option>
                    <option value="العلوم">العلوم</option>
                    <option value="الأدب">الأدب</option>
                  </select>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setUploadType('file')}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'file' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      ملف PDF
                    </button>
                    <button 
                      onClick={() => setUploadType('video')}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'video' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      فيديو
                    </button>
                  </div>
                </div>

                <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 text-center hover:border-emerald-200 transition-colors cursor-pointer group">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 transition-colors">
                    <Plus className="w-10 h-10 text-slate-300 group-hover:text-emerald-500" />
                  </div>
                  <p className="text-slate-400 font-bold">اسحب الملف هنا أو اضغط للاختيار</p>
                  <p className="text-[10px] text-slate-300 font-black uppercase mt-2 tracking-widest">PDF, DOCX, MP4 (Max 50MB)</p>
                </div>
                
                <button 
                  onClick={handleUpload}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  تأكيد الرفع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isPostModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">إنشاء منشور جديد</h3>
                <button onClick={() => setIsPostModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <textarea 
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="ماذا يدور في ذهنك؟"
                className="w-full h-48 bg-slate-50 rounded-[2rem] p-6 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none mb-6"
              />
              
              <button 
                onClick={handleCreatePost}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                نشر الآن
              </button>
            </motion.div>
          </motion.div>
        )}

        {selectedPostForComments && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">التعليقات</h3>
                <button onClick={() => setSelectedPostForComments(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <img src={comment.author_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_id}`} className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="font-bold text-slate-900 text-sm">{comment.author_name}</h5>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(comment.created_at).toLocaleTimeString('ar-EG')}</span>
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
                  <img src={selectedUserForChat.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserForChat.auth_id}`} className="w-10 h-10 rounded-xl" />
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
                <div key={msg.id} className={`flex ${msg.sender_id === profile?.auth_id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender_id === profile?.auth_id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                    <p className="font-medium leading-relaxed">{msg.content}</p>
                    <p className={`text-[9px] mt-1 font-bold uppercase ${msg.sender_id === profile?.auth_id ? 'text-emerald-100' : 'text-slate-300'}`}>
                      {msg.created_at?.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
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

// --- Admin Area ---

function AdminArea({ profile, adminTab, setAdminTab, logActivity }: { profile: UserProfile | null, adminTab: string, setAdminTab: (t: string) => void, logActivity: (a: string, d: string) => void }) {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [liveClassesCount, setLiveClassesCount] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
    });

    const unsubLogs = onSnapshot(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(10)), (snap) => {
      setActivityLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTotalLogs = onSnapshot(collection(db, 'activity_logs'), (snap) => {
      setTotalLogs(snap.size);
    });

    const unsubLive = onSnapshot(collection(db, 'live_classes'), (snap) => {
      setLiveClassesCount(snap.docs.filter(d => d.data().status === 'live').length);
    });

    return () => { unsubUsers(); unsubLogs(); unsubTotalLogs(); unsubLive(); };
  }, []);

  const handleApproveTeacher = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        account_status: 'approved'
      });
      const user = allUsers.find(u => u.id === userId);
      logActivity('وافق على أستاذ', `تم قبول طلب ${user?.first_name} ${user?.last_name}`);
    } catch (error) {
      console.error("Error approving teacher:", error);
    }
  };

  const handleRejectTeacher = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        account_status: 'rejected'
      });
      const user = allUsers.find(u => u.id === userId);
      logActivity('رفض أستاذ', `تم رفض طلب ${user?.first_name} ${user?.last_name}`);
    } catch (error) {
      console.error("Error rejecting teacher:", error);
    }
  };

  const handleFreezeAccount = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'frozen' ? 'approved' : 'frozen';
      await updateDoc(doc(db, 'users', userId), {
        account_status: newStatus
      });
      const user = allUsers.find(u => u.id === userId);
      logActivity(newStatus === 'frozen' ? 'جمد حساب' : 'ألغى تجميد حساب', `المستخدم: ${user?.first_name} ${user?.last_name}`);
    } catch (error) {
      console.error("Error freezing account:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-l border-slate-100 p-8 flex flex-col">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">لوحة الإدارة</h1>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">نظام علّمني</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: Layout, label: 'الرئيسية' },
            { id: 'stats', icon: BarChart3, label: 'الإحصائيات' },
            { id: 'students', icon: Users, label: 'الطلاب' },
            { id: 'teachers', icon: UserCheck, label: 'الأساتذة' },
            { id: 'approvals', icon: CheckCircle, label: 'طلبات الانضمام' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${adminTab === item.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => signOut(auth)}
          className="mt-auto flex items-center gap-4 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-6 h-6" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {adminTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">مرحباً بك، {profile?.first_name}</h2>
                <div className="flex gap-2">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <BarChart3 className="text-emerald-600 w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase mb-2">إجمالي الطلاب</p>
                  <h3 className="text-4xl font-black text-slate-900">{allUsers.filter(u => u.role === 'student').length}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase mb-2">إجمالي الأساتذة</p>
                  <h3 className="text-4xl font-black text-slate-900">{allUsers.filter(u => u.role === 'teacher').length}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase mb-2">البث المباشر</p>
                  <h3 className="text-4xl font-black text-slate-900">{liveClassesCount}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase mb-2">سجل النشاطات</p>
                  <h3 className="text-4xl font-black text-slate-900">{totalLogs}</h3>
                </div>
              </div>

              {/* Activity Logs */}
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Clock className="text-emerald-600 w-8 h-8" />
                  سجل النشاطات الأخير
                </h3>
                <div className="space-y-8">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-6 group">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mt-3 shadow-lg shadow-emerald-200 group-hover:scale-150 transition-transform"></div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-bold text-lg">
                          <span className="text-emerald-600">{log.user_name}</span> {log.action}
                        </p>
                        <p className="text-sm text-slate-400 font-medium mt-1">{log.details}</p>
                        <p className="text-xs text-slate-300 font-black uppercase mt-2 tracking-tighter">
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString('ar-EG') : new Date().toLocaleTimeString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">إحصائيات الزوار</h2>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="h-80 flex items-end justify-between gap-4">
                  {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 rounded-t-2xl relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="bg-emerald-600 rounded-t-2xl w-full absolute bottom-0 group-hover:bg-emerald-700 transition-colors"
                      />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">
                        {h * 12}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-6 text-slate-400 font-bold text-sm">
                  <span>الأحد</span>
                  <span>الاثنين</span>
                  <span>الثلاثاء</span>
                  <span>الأربعاء</span>
                  <span>الخميس</span>
                  <span>الجمعة</span>
                  <span>السبت</span>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'students' && (
            <motion.div 
              key="students"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">قائمة الطلاب</h2>
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-6 font-black text-slate-900">الطالب</th>
                      <th className="p-6 font-black text-slate-900">البريد الإلكتروني</th>
                      <th className="p-6 font-black text-slate-900">تاريخ الانضمام</th>
                      <th className="p-6 font-black text-slate-900">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allUsers.filter(u => u.role === 'student').map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 flex items-center gap-4">
                          <img src={u.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-12 h-12 rounded-xl" />
                          <span className="font-bold text-slate-900">{u.first_name} {u.last_name}</span>
                        </td>
                        <td className="p-6 text-slate-500 font-medium">{u.email}</td>
                        <td className="p-6 text-slate-400 text-sm">{u.created_at?.toDate().toLocaleDateString('ar-EG')}</td>
                        <td className="p-6">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">نشط</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {adminTab === 'teachers' && (
            <motion.div 
              key="teachers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">قائمة الأساتذة</h2>
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-6 font-black text-slate-900">الأستاذ</th>
                      <th className="p-6 font-black text-slate-900">البريد الإلكتروني</th>
                      <th className="p-6 font-black text-slate-900">الحالة</th>
                      <th className="p-6 font-black text-slate-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allUsers.filter(u => u.role === 'teacher' && u.account_status === 'approved').map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 flex items-center gap-4">
                          <img src={u.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-12 h-12 rounded-xl" />
                          <span className="font-bold text-slate-900">{u.first_name} {u.last_name}</span>
                        </td>
                        <td className="p-6 text-slate-500 font-medium">{u.email}</td>
                        <td className="p-6">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">معتمد</span>
                        </td>
                        <td className="p-6">
                          <button 
                            onClick={() => handleFreezeAccount(u.id, u.account_status)}
                            className={`${u.account_status === 'frozen' ? 'text-emerald-600' : 'text-red-500'} font-bold hover:underline`}
                          >
                            {u.account_status === 'frozen' ? 'إلغاء التجميد' : 'تجميد الحساب'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {adminTab === 'approvals' && (
            <motion.div 
              key="approvals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">طلبات انضمام الأساتذة</h2>
              
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {allUsers.filter(u => u.role === 'teacher' && u.account_status === 'pending').map((u) => (
                    <div key={u.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-6">
                        <img src={u.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-20 h-20 rounded-[1.5rem] bg-slate-100 border-2 border-emerald-50 shadow-sm" />
                        <div>
                          <h4 className="font-black text-slate-900 text-xl">{u.first_name} {u.last_name}</h4>
                          <p className="text-slate-500 font-medium">{u.email}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">قيد المراجعة</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleApproveTeacher(u.id)}
                          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                        >
                          قبول الطلب
                        </button>
                        <button 
                          onClick={() => handleRejectTeacher(u.id)}
                          className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black hover:bg-red-100 transition-all"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  ))}
                  {allUsers.filter(u => u.role === 'teacher' && u.account_status === 'pending').length === 0 && (
                    <div className="p-20 text-center">
                      <UserCheck className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                      <p className="text-slate-400 font-black text-xl">لا توجد طلبات معلقة حالياً</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
