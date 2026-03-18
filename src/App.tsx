import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Plus, 
  Image as ImageIcon, 
  MapPin, 
  Clock, 
  Search, 
  ArrowRight,
  Settings,
  Globe,
  Compass,
  Navigation,
  Heart,
  Send,
  Camera,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

// --- Types ---
interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  images: string[];
  date: string;
  preview: string;
}

const CATEGORIES = [
  "الرئيسية",
  "البلدان العربية",
  "البلدان الأوروبية",
  "البلدان الأمريكية",
  "البلدان الآسيوية"
];

const CATEGORY_MAP: Record<string, string> = {
  "Home": "الرئيسية",
  "Arab Countries": "البلدان العربية",
  "European Countries": "البلدان الأوروبية",
  "American Countries": "البلدان الأمريكية",
  "Asian Countries": "البلدان الآسيوية"
};

const TRENDING_COUNTRIES = [
  { name: "الولايات المتحدة", image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&q=80&w=800" },
  { name: "فرنسا", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800" },
  { name: "تايلاند", image: "https://images.unsplash.com/photo-1528181304800-2f140819ad9c?auto=format&fit=crop&q=80&w=800" },
  { name: "اليابان", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800" },
  { name: "المغرب", image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=800" },
  { name: "الإمارات", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800" }
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: "سحر الرمال الذهبية في دبي",
    content: "دبي مدينة العجائب، حيث يلتقي الصحراء بالبحر والمستقبل بالماضي. من برج خليفة إلى الأسواق التقليدية، هي وجهة لا مثيل لها.",
    category: "البلدان العربية",
    images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800"],
    date: "2024-03-15",
    preview: "اكتشف الفخامة والتقاليد في أكثر مدن الشرق الأوسط حيوية."
  },
  {
    id: '2',
    title: "رومانسية باريس الخالدة",
    content: "باريس دائماً فكرة جيدة. برج إيفل، اللوفر، ومقاهي مونمارتر الساحرة تنتظر أولئك الذين يبحثون عن الجمال والإلهام.",
    category: "البلدان الأوروبية",
    images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"],
    date: "2024-03-14",
    preview: "تجول في شوارع أكثر مدن العالم رومانسية."
  },
  {
    id: '3',
    title: "طوكيو: بين التكنولوجيا والتقاليد",
    content: "طوكيو مدينة لا تنام، ومع ذلك تجد السلام في معابدها القديمة. جرب إثارة تقاطع شيبويا وهدوء ضريح ميجي.",
    category: "البلدان الآسيوية",
    images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800"],
    date: "2024-03-13",
    preview: "استكشف التباين الرائع بين التكنولوجيا العالية والتاريخ."
  },
  {
    id: '4',
    title: "📸 أماكن سياحية يجب زيارتها في فيلادلفيا",
    content: "فيلادلفيا ليست مجرد وجهة — إنها تجربة عبر الزمن. من اللحظات التاريخية التي صنعتها إلى المشاهد العصرية التي تحتفل بالحياة… هذه المدينة تمنحك قصصًا، صورًا، وتجارب لا تُنسى.\n\n🛎️ 1. الحديقة التاريخية للاستقلال (Independence National Historical Park)\nفي قلب فيلادلفيا التاريخي توجد هذه الحديقة التي تضم قاعة الاستقلال وجرس الحرية، حيث تم مناقشة إعلان الاستقلال وتوقيعه.\n\n🗿 2. تمثال LOVE Park\nساحة LOVE Park تجمع بين الفن الحضري والمعنى العاطفي، وتُعد من أفضل الأماكن لالتقاط الصور التذكارية.\n\n🖼️ 3. شارع Elfreth’s Alley\nأقدم شارع سكني مأهول في أمريكا، يعود تاريخه إلى عام 1703.\n\n🍽️ المشهد الغذائي\nالمطبخ في فيلادلفيا حيوي ومتنوّع، من وجبات Philly Cheesesteak الكلاسيكية إلى المطاعم العالمية الفاخرة.",
    category: "البلدان الأمريكية",
    images: [
      "https://images.unsplash.com/photo-1571168050961-30043183592c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&q=80&w=800"
    ],
    date: "2024-03-18",
    preview: "فيلادلفيا ليست مجرد وجهة — إنها تجربة عبر الزمن من اللحظات التاريخية إلى المشاهد العصرية."
  }
];

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState("الرئيسية");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Admin Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[1]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('voyagea_articles');
    if (saved) {
      setArticles(JSON.parse(saved));
    } else {
      setArticles(INITIAL_ARTICLES);
      localStorage.setItem('voyagea_articles', JSON.stringify(INITIAL_ARTICLES));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles);
    localStorage.setItem('voyagea_articles', JSON.stringify(newArticles));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const article: Article = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      images: newImages.length > 0 ? newImages : ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800"],
      date: new Date().toLocaleDateString('ar-EG'),
      preview: newContent.substring(0, 100) + "..."
    };

    saveArticles([article, ...articles]);
    setNewTitle('');
    setNewContent('');
    setNewImages([]);
    setIsAdminOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setNewImages(prev => [...prev, ...results]);
      });
    }
  };

  const filteredArticles = activeCategory === "الرئيسية" 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const latestArticles = articles.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] font-sans selection:bg-[#C5A059] selection:text-white" dir="rtl">
      
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md py-4 shadow-md' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${scrolled ? 'bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/20' : 'bg-white/20 backdrop-blur-md text-white'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <h1 className={`text-2xl font-black tracking-tighter uppercase ${scrolled ? 'text-[#1A1A1A]' : 'text-white'}`}>
              Voyagea
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-bold tracking-widest transition-all hover:text-[#C5A059] relative py-2 ${
                  activeCategory === cat 
                    ? 'text-[#C5A059]' 
                    : scrolled ? 'text-[#1A1A1A]' : 'text-white'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A059] rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAdminOpen(true)}
              className={`p-2.5 rounded-xl transition-all ${scrolled ? 'bg-slate-100 text-slate-600 hover:bg-[#C5A059] hover:text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="إضافة مقال"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-all ${scrolled ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white'}`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-white transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => { setActiveCategory(cat); setIsMenuOpen(false); }}
              className="text-2xl font-black tracking-tighter text-[#1A1A1A] hover:text-[#C5A059]"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- Hero Section --- */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-block px-5 py-1.5 bg-[#C5A059] text-white text-[11px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in-up rounded-full">
            دليلك المتكامل للسفر
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight mb-8 animate-fade-in-up delay-100">
            استكشف <span className="text-[#C5A059]">أجمل</span> وجهات العالم
          </h2>
          <p className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
            منصة لاستكشاف أفضل الأماكن في العالم — مقالات، توصيات، صور، ودليل السفر المتكامل.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
            <button 
              onClick={() => document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-5 bg-[#C5A059] text-white font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-[#C5A059] transition-all shadow-2xl flex items-center gap-3 group"
            >
              ابدأ الاستكشاف <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>
      </header>

      {/* --- Latest Articles --- */}
      <section id="latest" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="text-[#C5A059] font-black uppercase tracking-widest text-xs mb-3 block">الجديد لدينا</span>
            <h3 className="text-5xl font-black text-[#1A1A1A] tracking-tighter">المقالات المنشورة حديثاً</h3>
          </div>
          <div className="hidden md:block w-1/3 h-px bg-slate-200 mb-4"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {latestArticles.map((article) => (
            <div key={article.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 shadow-2xl">
                <img 
                  src={article.images[0]} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={article.title}
                />
                <div className="absolute top-6 right-6">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-sm">
                    {article.category}
                  </span>
                </div>
              </div>
              <h4 className="text-2xl font-black text-[#1A1A1A] mb-4 group-hover:text-[#C5A059] transition-colors">
                {article.title}
              </h4>
              <p className="text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                {article.preview}
              </p>
              <button className="flex items-center gap-2 text-[#C5A059] font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                اقرأ المقال <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Trending Countries --- */}
      <section className="py-24 bg-[#F8F9FA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <span className="text-[#C5A059] font-black uppercase tracking-widest text-xs mb-3 block">حول العالم</span>
          <h3 className="text-5xl font-black tracking-tighter text-[#1A1A1A]">أفضل البلدان التي يجب زيارتها</h3>
        </div>

        <div className="flex gap-8 overflow-x-auto px-6 pb-12 no-scrollbar snap-x">
          {TRENDING_COUNTRIES.map((country) => (
            <div 
              key={country.name} 
              className="flex-none w-72 md:w-96 aspect-[3/4] relative rounded-[3rem] overflow-hidden group snap-center cursor-pointer shadow-xl"
            >
              <img 
                src={country.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={country.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-10 right-10 text-right">
                <h5 className="text-3xl font-black tracking-tighter mb-2 text-white">{country.name}</h5>
                <div className="w-0 group-hover:w-16 h-1 bg-[#C5A059] transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- All Articles Grid --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div>
            <span className="text-[#C5A059] font-black uppercase tracking-widest text-xs mb-3 block">الأرشيف</span>
            <h3 className="text-5xl font-black text-[#1A1A1A] tracking-tighter">
              {activeCategory === "الرئيسية" ? "جميع الوجهات" : activeCategory}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#C5A059] text-white shadow-xl shadow-[#C5A059]/30 scale-105' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-[3rem] p-5 shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500">
              <div className="relative aspect-video overflow-hidden rounded-[2.5rem] mb-6">
                <img 
                  src={article.images[0]} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={article.title}
                />
                <div className="absolute bottom-4 right-4">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-sm">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <Clock className="w-3.5 h-3.5" /> {article.date}
                </div>
                <h4 className="text-2xl font-black text-[#1A1A1A] mb-4 group-hover:text-[#C5A059] transition-colors">
                  {article.title}
                </h4>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                  {article.preview}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="text-[11px] font-black uppercase tracking-widest text-[#C5A059] flex items-center gap-2 group/btn">
                    اقرأ المزيد <ArrowRight className="w-4 h-4 rotate-180 group-hover/btn:-translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
              <Navigation className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest">لا توجد مقالات في هذا التصنيف حالياً.</p>
          </div>
        )}
      </section>

      {/* --- Footer --- */}
      <footer className="bg-[#1A1A1A] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-[#C5A059] rounded-2xl flex items-center justify-center shadow-lg shadow-[#C5A059]/20">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">
                Voyagea
              </h1>
            </div>
            <p className="text-white/60 font-medium text-lg max-w-md leading-relaxed">
              نحن مجتمع عالمي من المسافرين، رواة القصص، والحالمين. انضم إلينا بينما نستكشف أجمل زوايا كوكبنا.
            </p>
          </div>
          <div>
            <h6 className="text-xs font-black uppercase tracking-widest text-[#C5A059] mb-10">استكشف</h6>
            <ul className="space-y-5">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button onClick={() => setActiveCategory(cat)} className="text-white/60 font-bold hover:text-[#C5A059] transition-colors">{cat}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="text-xs font-black uppercase tracking-widest text-[#C5A059] mb-10">النشرة البريدية</h6>
            <p className="text-white/60 text-sm mb-8">احصل على أحدث القصص مباشرة في بريدك الإلكتروني.</p>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="flex-1 bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-[#C5A059] outline-none text-white"
              />
              <button className="p-4 bg-[#C5A059] text-white rounded-2xl hover:bg-white hover:text-[#C5A059] transition-all">
                <Send className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">© 2024 Voyagea. جميع الحقوق محفوظة.</p>
          <div className="flex gap-10">
            <button className="text-white/40 hover:text-[#C5A059] transition-colors"><Globe className="w-6 h-6" /></button>
            <button className="text-white/40 hover:text-[#C5A059] transition-colors"><MapPin className="w-6 h-6" /></button>
            <button className="text-white/40 hover:text-[#C5A059] transition-colors"><Search className="w-6 h-6" /></button>
          </div>
        </div>
      </footer>

      {/* --- Admin Modal --- */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#1A1A1A]/95 backdrop-blur-2xl" onClick={() => setIsAdminOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-modal-in">
            <div className="p-12">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="text-[#C5A059] font-black uppercase tracking-widest text-[10px] mb-3 block">لوحة التحكم</span>
                  <h3 className="text-4xl font-black text-[#1A1A1A] tracking-tighter">إضافة مقال جديد</h3>
                </div>
                <button onClick={() => setIsAdminOpen(false)} className="p-4 bg-slate-50 text-slate-400 rounded-[2rem] hover:bg-red-50 hover:text-red-500 transition-all">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <form onSubmit={handlePublish} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 mr-6">عنوان المقال</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: أسرار المعابد المفقودة في بالي"
                    className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-5 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-[#C5A059] outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 mr-6">التصنيف</label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-5 font-bold text-slate-900 focus:ring-2 focus:ring-[#C5A059] outline-none appearance-none cursor-pointer"
                    >
                      {CATEGORIES.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 mr-6">الصور</label>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-5 font-bold text-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                    >
                      <Camera className="w-5 h-5" />
                      {newImages.length > 0 ? `${newImages.length} صور` : 'تحميل صور'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 mr-6">نص المقال</label>
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="شاركنا تفاصيل التجربة..."
                    rows={6}
                    className="w-full bg-slate-50 border-none rounded-[2.5rem] px-8 py-6 text-lg font-medium text-slate-700 focus:ring-2 focus:ring-[#C5A059] outline-none transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white py-6 rounded-full font-black uppercase tracking-widest text-lg shadow-2xl hover:bg-[#C5A059] transition-all transform active:scale-95"
                >
                  نشر المقال
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Floating Admin Button --- */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-10 left-10 z-50 w-16 h-16 bg-[#C5A059] text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-90 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* --- Styles --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Cairo', sans-serif;
          overflow-x: hidden;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.6s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
