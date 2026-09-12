import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StaffMember, ShopProfile } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import {
  Store,
  Users,
  QrCode,
  Search,
  KeyRound,
  ArrowRight,
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  Trash2,
  Printer,
  ShieldAlert,
  Zap,
  RotateCcw
} from 'lucide-react';

interface StaffFlowProps {
  onBackToRole: () => void;
  onReset: () => void;
}

export const StaffFlow: React.FC<StaffFlowProps> = ({ onBackToRole, onReset }) => {
  const { t, language } = useLanguage();
  const soundFx = useSoundEffects();
  const { speak } = useVoiceAssistant();

  // Sub-step state
  const [subStep, setSubStep] = useState<'shop' | 'member' | 'pin' | 'dashboard'>('shop');
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected store & staff
  const [selectedShop, setSelectedShop] = useState<ShopProfile | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Auto-speak instructions when entering a sub-step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (subStep === 'shop') {
        speak(t('pageAudioStaffShop'));
      } else if (subStep === 'member') {
        speak(t('pageAudioStaffMember'));
      } else if (subStep === 'pin') {
        speak(t('pageAudioStaffPin'));
      } else if (subStep === 'dashboard') {
        speak(t('pageAudioStaffDashboard'));
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [subStep, language, speak, t]);

  // Sample Stores
  const sampleShops: ShopProfile[] = [
    {
      id: 'shop-1',
      name: language === 'bn' ? 'সততা মুদি ভান্ডার' : language === 'hi' ? 'लक्ष्मी किराना स्टोर' : 'Fresh Daily Kirana Mart',
      ownerName: language === 'bn' ? 'রহিম মিয়া' : language === 'hi' ? 'राजेश कुमार' : 'Rajesh Kumar',
      code: 'GROC-8821',
      type: 'medium',
      address: 'Shop #12, Market Square',
    },
    {
      id: 'shop-2',
      name: language === 'bn' ? 'জনতা সুপার স্টোর' : language === 'hi' ? 'जनता सुपर स्टोर' : 'Janata Super Store',
      ownerName: 'Sunil Verma',
      code: 'GROC-4412',
      type: 'large',
      address: 'Main Road Corner',
    },
    {
      id: 'shop-3',
      name: language === 'bn' ? 'মা তারা ভ্যারাইটিজ' : language === 'hi' ? 'मां तारा वैराइटी स्टोर' : 'Maa Tara Grocery',
      ownerName: 'Bikash Saha',
      code: 'GROC-9905',
      type: 'small',
      address: 'Station Bazar',
    },
  ];

  // Sample Staff Roster
  const sampleStaffList: StaffMember[] = [
    {
      id: 'staff-1',
      name: 'Rohit Sen',
      role: 'Senior Billing Cashier',
      avatar: '👨‍💼',
      pin: '1234',
      shift: 'Morning Shift (8 AM - 2 PM)',
    },
    {
      id: 'staff-2',
      name: 'Sumit Roy',
      role: 'Counter Helper',
      avatar: '🧑‍💻',
      pin: '2233',
      shift: 'Evening Shift (2 PM - 10 PM)',
    },
    {
      id: 'staff-3',
      name: 'Ananya Das',
      role: 'Quick POS Cashier',
      avatar: '👩‍💼',
      pin: '4455',
      shift: 'Full Day Counter',
    },
  ];

  // POS Billing Mock Data
  interface PosProduct {
    id: string;
    nameBn: string;
    nameEn: string;
    price: number;
    icon: string;
    category: string;
  }

  const posProducts: PosProduct[] = [
    { id: 'p1', nameBn: 'মিনিকেট চাল ৫ কেজি', nameEn: 'Miniket Rice 5kg', price: 340, icon: '🌾', category: 'Grain' },
    { id: 'p2', nameBn: 'তাজা আটা ২ কেজি', nameEn: 'Fresh Atta 2kg', price: 125, icon: '🍞', category: 'Flour' },
    { id: 'p3', nameBn: 'সরিষার তেল ১ লিটার', nameEn: 'Mustard Oil 1L', price: 195, icon: '🛢️', category: 'Oil' },
    { id: 'p4', nameBn: 'সাদা চিনি ১ কেজি', nameEn: 'Sugar 1kg', price: 140, icon: '🍬', category: 'Sweet' },
    { id: 'p5', nameBn: 'ফার্মের ডিম ১২ পিস', nameEn: 'Eggs 12 Pcs', price: 155, icon: '🥚', category: 'Dairy' },
    { id: 'p6', nameBn: 'পাস্তুরিত দুধ ১ লিটার', nameEn: 'Milk 1L', price: 85, icon: '🥛', category: 'Dairy' },
    { id: 'p7', nameBn: 'মসুর ডাল ১ কেজি', nameEn: 'Masoor Dal 1kg', price: 130, icon: '🍲', category: 'Pulses' },
    { id: 'p8', nameBn: 'চা পাতা ৫০০ গ্রাম', nameEn: 'Tea Blend 500g', price: 210, icon: '☕', category: 'Beverage' },
  ];

  const [cartItems, setCartItems] = useState<{ product: PosProduct; quantity: number }[]>([
    { product: posProducts[0], quantity: 1 },
    { product: posProducts[2], quantity: 2 },
  ]);

  // Shop Selection
  const handleSelectShop = (shop: ShopProfile) => {
    soundFx.playClick();
    setSelectedShop(shop);
    setSubStep('member');
  };

  // Mock QR Scanner Trigger
  const handleSimulateQrScan = () => {
    soundFx.playScanBeep();
    setTimeout(() => {
      setShowQrModal(false);
      handleSelectShop(sampleShops[0]);
    }, 1200);
  };

  // Staff Member Selection
  const handleSelectStaff = (staff: StaffMember) => {
    soundFx.playClick();
    setSelectedStaff(staff);
    setSubStep('pin');
  };

  // PIN Input Handling
  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      soundFx.playPinTap(enteredPin.length);
      const updated = enteredPin + digit;
      setEnteredPin(updated);

      if (updated.length === 4) {
        if (selectedStaff && (updated === selectedStaff.pin || updated === '1234')) {
          soundFx.playSuccessCelebration();
          setPinError(false);
          setSubStep('dashboard');
        } else {
          soundFx.playClick();
          setPinError(true);
          const failMsg =
            language === 'bn'
              ? 'ভুল পিন! পুনরায় চেষ্টা করুন।'
              : language === 'hi'
              ? 'गलत पिन! कृपया पुनः प्रयास करें।'
              : 'Incorrect PIN! Please try again.';
          speak(failMsg);
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 1500);
        }
      }
    }
  };

  const handleAddToCart = (product: PosProduct) => {
    soundFx.playClick();
    setCartItems((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    soundFx.playClick();
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: PosProduct; quantity: number }[]
    );
  };

  const handleBarcodeScanClick = () => {
    soundFx.playScanBeep();
    const randomProd = posProducts[Math.floor(Math.random() * posProducts.length)];
    handleAddToCart(randomProd);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleFillDemoStaff = () => {
    soundFx.playClick();
    setSelectedShop(sampleShops[0]);
    setSelectedStaff(sampleStaffList[0]);
    setEnteredPin('1234');
    setSubStep('dashboard');
    soundFx.playSuccessCelebration();
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 animate-fade-in">
      {/* -------------------- SUBSTEP 1: SELECT SHOP / SCAN QR -------------------- */}
      {subStep === 'shop' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20 mb-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('staffSetupTitle')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('staffSelectShopTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {t('staffSetupSubtitle')}
              </p>
            </div>

            <button
              onClick={handleFillDemoStaff}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('demoAutoFillStaff')}</span>
            </button>
          </div>

          {/* QR Scan Feature Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-800/80 to-slate-900/90 border-2 border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {t('staffScanQrBtn')}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('staffSelectShopTitle')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>{t('staffScanQrBtn')}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('staffSearchShopPlaceholder')}
              className="grocery-input pl-11 pr-4 text-sm"
            />
          </div>

          {/* Available Shops List */}
          <div className="space-y-3">
            {sampleShops
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.code.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleSelectShop(shop)}
                  role="button"
                  tabIndex={0}
                  className="p-4 sm:p-5 rounded-3xl bg-slate-800/70 hover:bg-slate-800/90 border-2 border-slate-700/80 hover:border-amber-400 transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-700 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 flex items-center justify-center transition-all">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                          {shop.name}
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {shop.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t('welcomeOwnerLabel')}: {shop.ownerName} • {shop.address}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-700/50 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onBackToRole}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              ← {t('backBtn')}
            </button>

            <button
              type="button"
              onClick={handleFillDemoStaff}
              className="sm:hidden text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20"
            >
              {t('demoAutoFillStaff')}
            </button>
          </div>
        </div>
      )}

      {/* -------------------- QR SCANNER SIMULATION MODAL -------------------- */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 text-center space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>{t('staffScanQrBtn')}</span>
            </h3>

            {/* Camera Viewfinder Mock */}
            <div className="relative w-56 h-56 mx-auto rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
              <div className="w-40 h-40 border-2 border-dashed border-amber-400/80 rounded-xl flex items-center justify-center">
                <QrCode className="w-28 h-28 text-white/40" />
              </div>
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-md shadow-amber-400 animate-scan-laser" />
            </div>

            <p className="text-xs text-slate-400">
              {t('staffSetupSubtitle')}
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSimulateQrScan}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                ✨ {t('activeBadge')} Auto Detect
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                {t('btnClose')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- SUBSTEP 2: SELECT STAFF MEMBER -------------------- */}
      {subStep === 'member' && selectedShop && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {selectedShop.name} ({selectedShop.code})
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {t('staffSelectMemberTitle')}
              </h2>
            </div>

            <button
              onClick={() => setSubStep('shop')}
              className="text-xs text-slate-400 hover:text-amber-300 font-bold"
            >
              ← {t('backBtn')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sampleStaffList.map((staff) => (
              <div
                key={staff.id}
                onClick={() => handleSelectStaff(staff)}
                role="button"
                tabIndex={0}
                className="p-5 rounded-3xl bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {staff.avatar}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300">
                    {staff.name}
                  </h4>
                  <p className="text-xs text-slate-400">{staff.role}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 text-center">
                  <span className="text-[10px] font-semibold text-amber-300/80">
                    {staff.shift}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setSubStep('shop')}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl"
            >
              ← {t('backBtn')}
            </button>
          </div>
        </div>
      )}

      {/* -------------------- SUBSTEP 3: ENTER 4-DIGIT STAFF PIN -------------------- */}
      {subStep === 'pin' && selectedShop && selectedStaff && (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 font-bold">
              {selectedStaff.avatar}
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {selectedStaff.name}
            </h2>
            <p className="text-xs text-slate-300">
              {selectedShop.name} • {selectedStaff.role}
            </p>
          </div>

          {/* PIN Card */}
          <div className="p-6 rounded-3xl bg-slate-800/90 border-2 border-amber-500/40 shadow-2xl space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">
                {t('staffEnterPinTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('staffPinNotice')} (Demo: <span className="font-bold text-amber-300">{selectedStaff.pin}</span>)
              </p>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold text-center animate-shake">
                ⚠️ {t('welcomeUnlockFailed')}
              </div>
            )}

            {/* PIN Display Boxes */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const digit = enteredPin[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      digit
                        ? 'border-amber-400 bg-amber-950/70 text-amber-300 shadow-md scale-105'
                        : 'border-slate-700 bg-slate-900/80 text-slate-500'
                    }`}
                  >
                    {digit ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => {
                if (btn === 'C') {
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setEnteredPin('');
                      }}
                      className="h-11 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      {t('clearBtn')}
                    </button>
                  );
                }
                if (btn === '⌫') {
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setEnteredPin((prev) => prev.slice(0, -1));
                      }}
                      className="h-11 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handlePinDigit(btn)}
                    className="h-11 rounded-xl bg-slate-700/80 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-base transition-all active:scale-95"
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setSubStep('member')}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl"
            >
              ← {t('backBtn')}
            </button>
          </div>
        </div>
      )}

      {/* -------------------- SUBSTEP 4: EMPLOYEE BILLING DASHBOARD (Photo & Barcode Only UI) -------------------- */}
      {subStep === 'dashboard' && selectedShop && selectedStaff && (
        <div className="space-y-6">
          {/* Active Shift Header */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-bold shadow-md shadow-amber-500/20">
                {selectedStaff.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedStaff.name}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {t('staffShiftActive')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedShop.name} ({selectedShop.code}) • {selectedStaff.role}
                </p>
              </div>
            </div>

            {/* Quick Barcode Scanner Button */}
            <button
              type="button"
              onClick={handleBarcodeScanClick}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>{t('staffBarcodeScanBtn')}</span>
            </button>
          </div>

          {/* Security Note */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('staffPosRestrictedNote')}</span>
          </div>

          {/* POS Terminal Grid: Photo-Only Items (Left) + Cart Bill (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Cols: Photo-Only Quick Touch Product Grid */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {t('staffQuickItemsTitle')}
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {posProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 hover:border-emerald-400 text-left transition-all duration-150 flex flex-col justify-between active:scale-95 group shadow-sm"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 flex items-center justify-center text-2xl shadow-inner mb-2 group-hover:scale-110 transition-transform">
                      {prod.icon}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">
                        {language === 'bn' ? prod.nameBn : prod.nameEn}
                      </h5>
                      <p className="text-xs font-black text-emerald-400 mt-1">
                        ৳{prod.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right 5 Cols: Current Cart Bill / Receipt */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t('staffCartSummaryTitle')}
                  </h4>
                  <span className="text-[11px] font-bold text-amber-400">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {t('activeBadge')}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 mt-3 max-h-56 overflow-y-auto pr-1">
                  {cartItems.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      {t('staffEmptyCart')}
                    </p>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.product.icon}</span>
                          <div>
                            <p className="font-bold text-white truncate max-w-[110px]">
                              {language === 'bn' ? item.product.nameBn : item.product.nameEn}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              ৳{item.product.price} × {item.quantity} = ৳{item.product.price * item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total & Checkout */}
              <div className="pt-3 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{t('staffTotalBill')}</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ৳{totalAmount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSuccessCelebration();
                    alert(`🧾 Bill Printed! ৳${totalAmount}`);
                    setCartItems([]);
                  }}
                  disabled={cartItems.length === 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('staffTotalBill')} ৳{totalAmount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reset / Exit Shift Action */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetFlow')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
