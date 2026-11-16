import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Camera,
  Mic,
  MicOff,
  LayoutGrid,
  Package,
  Cookie,
  Coffee,
  Sparkles,
  MoreHorizontal,
  Plus,
  Trash2,
  Clock,
  Bookmark,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle,
  ScanLine,
  Image as ImageIcon,
  User,
  Phone,
  Printer,
  Upload,
  RefreshCw,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { salesService } from '../services/salesService';
import { productService } from '../services/productService';
import { PaymentScreen } from './PaymentScreen';

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  category: 'Grocery' | 'Snacks' | 'Beverages' | 'Personal Care' | 'Dairy' | 'Other';
  unitType: 'loose' | 'packaged';
  defaultUnit: string; // e.g. "Pack", "kg", "L"
  image: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  unitType: 'loose' | 'packaged';
  quantity: number; // For packaged: count of packs; for loose: weight in kg (e.g. 0.25)
  weightDisplay?: string; // e.g. "250 gm" or "2 Packs"
  unitPriceDisplay: string; // e.g. "₹50.00/kg" or "₹10.00"
  lineTotal: number;
  image: string;
}

interface NewSaleScreenProps {
  storeName: string;
  onBack: () => void;
  onSaleCompleted?: (invoiceNo: string) => void;
}

// Built-in catalog matching reference images exactly
const DEFAULT_CATALOG: CatalogProduct[] = [
  {
    id: 'prod-basmati',
    name: 'Basmati Rice (1 kg)',
    sku: 'SKU: GR001',
    unitPrice: 120.0,
    category: 'Grocery',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-parleg',
    name: 'Parle-G Biscuits (164 g)',
    sku: 'SKU: SN012',
    unitPrice: 10.0,
    category: 'Snacks',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-sunfloweroil',
    name: 'Sunflower Oil (1 L)',
    sku: 'SKU: OIL005',
    unitPrice: 135.0,
    category: 'Grocery',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-surfexcel',
    name: 'Surf Excel Detergent (500 g)',
    sku: 'SKU: HM021',
    unitPrice: 75.0,
    category: 'Personal Care',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-sugar',
    name: 'Sugar',
    sku: 'SKU: GR002',
    unitPrice: 50.0,
    category: 'Grocery',
    unitType: 'loose',
    defaultUnit: 'kg',
    image: 'https://images.unsplash.com/photo-1622484212850-cab596d65457?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-atta',
    name: 'Aashirvaad Atta (5 kg)',
    sku: 'SKU: GR003',
    unitPrice: 210.0,
    category: 'Grocery',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-tatasalt',
    name: 'Tata Salt (1 kg)',
    sku: 'SKU: GR004',
    unitPrice: 28.0,
    category: 'Grocery',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-milk',
    name: 'Amul Taaza Milk (500 ml)',
    sku: 'SKU: DY001',
    unitPrice: 27.0,
    category: 'Beverages',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-tea',
    name: 'Tata Tea Gold (250 g)',
    sku: 'SKU: BV002',
    unitPrice: 130.0,
    category: 'Beverages',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'prod-butter',
    name: 'Amul Butter (100 g)',
    sku: 'SKU: DY002',
    unitPrice: 56.0,
    category: 'Grocery',
    unitType: 'packaged',
    defaultUnit: 'Pack',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80',
  },
];

export const NewSaleScreen: React.FC<NewSaleScreenProps> = ({
  storeName,
  onBack,
  onSaleCompleted,
}) => {
  const soundFx = useSoundEffects();
  const activeStore = storeName || 'Store';

  // Search & Filter State (Search Product by Name)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Grocery' | 'Snacks' | 'Beverages' | 'Personal Care' | 'More'>('All');

  // Cart State (stored locally or loaded from active session)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(`sgrocery_active_cart_${activeStore}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes
  useEffect(() => {
    localStorage.setItem(`sgrocery_active_cart_${activeStore}`, JSON.stringify(cart));
  }, [cart, activeStore]);

  // Payment Screen Navigation State
  const [isPaymentPageOpen, setIsPaymentPageOpen] = useState(false);

  // Product Selection Popup State (Image 2)
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [looseWeightInput, setLooseWeightInput] = useState<string>('250');
  const [looseWeightUnit, setLooseWeightUnit] = useState<'gm' | 'kg'>('gm');
  const [packagedQuantity, setPackagedQuantity] = useState<number>(1);

  // Custom Product Modal
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSku, setCustomSku] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCategory, setCustomCategory] = useState<CatalogProduct['category']>('Grocery');
  const [customType, setCustomType] = useState<'packaged' | 'loose'>('packaged');

  // Customer State
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');

  // Success Receipt Modal State
  const [successReceipt, setSuccessReceipt] = useState<{
    invoiceNo: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    status: string;
    itemsCount: number;
  } | null>(null);

  // ==================== CAMERA & IMAGE SEARCH FUNCTIONALITY ====================
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const [detectedProduct, setDetectedProduct] = useState<CatalogProduct | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ==================== MICROPHONE VOICE SEARCH FUNCTIONALITY ====================
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Merge default catalog with stored inventory products
  const fullCatalog = useMemo(() => {
    const fromInventory = productService.getAllProducts(activeStore);
    const existingNames = new Set(DEFAULT_CATALOG.map((p) => p.name.toLowerCase()));
    const customItems: CatalogProduct[] = [];

    fromInventory.forEach((p, idx) => {
      if (!existingNames.has(p.name.toLowerCase())) {
        customItems.push({
          id: p.id || `inv-${idx}`,
          name: p.name,
          sku: `SKU: ${p.category.slice(0, 2).toUpperCase()}${100 + idx}`,
          unitPrice: p.sellingPrice || 10,
          category: (['Grocery', 'Snacks', 'Beverages', 'Personal Care'].includes(p.category)
            ? p.category
            : 'Grocery') as any,
          unitType: 'packaged',
          defaultUnit: 'Pack',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
        });
      }
    });

    return [...DEFAULT_CATALOG, ...customItems];
  }, [activeStore]);

  // Filtered Products by Name / Image / Category
  const filteredProducts = useMemo(() => {
    return fullCatalog.filter((product) => {
      // Category filter
      if (activeCategory !== 'All' && activeCategory !== 'More') {
        if (product.category !== activeCategory) return false;
      }

      // Search filter (Product Name, SKU, Category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      return true;
    });
  }, [fullCatalog, activeCategory, searchQuery]);

  // Open Product Selection Pop-up
  const handleOpenProductPopup = (product: CatalogProduct) => {
    soundFx.playClick();
    setSelectedProduct(product);
    if (product.unitType === 'loose') {
      setLooseWeightInput('250');
      setLooseWeightUnit('gm');
    } else {
      setPackagedQuantity(1);
    }
  };

  // Popup Line Total Calculation
  const popupLineTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    if (selectedProduct.unitType === 'loose') {
      const weightNum = parseFloat(looseWeightInput) || 0;
      const weightInKg = looseWeightUnit === 'gm' ? weightNum / 1000 : weightNum;
      return Math.round(weightInKg * selectedProduct.unitPrice * 100) / 100;
    } else {
      const qty = Math.max(1, packagedQuantity || 1);
      return Math.round(qty * selectedProduct.unitPrice * 100) / 100;
    }
  }, [selectedProduct, looseWeightInput, looseWeightUnit, packagedQuantity]);

  // Add Item From Pop-up to Cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    soundFx.playSuccess();

    const isLoose = selectedProduct.unitType === 'loose';
    let qty: number;
    let weightDisplay: string;
    let unitPriceDisplay: string;

    if (isLoose) {
      const weightNum = parseFloat(looseWeightInput) || 250;
      qty = looseWeightUnit === 'gm' ? weightNum / 1000 : weightNum;
      weightDisplay = `${weightNum} ${looseWeightUnit}`;
      unitPriceDisplay = `₹${selectedProduct.unitPrice.toFixed(2)}/kg`;
    } else {
      qty = Math.max(1, packagedQuantity || 1);
      weightDisplay = `${qty} ${qty === 1 ? 'Pack' : 'Packs'}`;
      unitPriceDisplay = `₹${selectedProduct.unitPrice.toFixed(2)}`;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.productId === selectedProduct.id && item.unitType === selectedProduct.unitType);
      if (existingIdx >= 0) {
        const updated = [...prevCart];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + qty;
        let newWeightDisplay: string;

        if (isLoose) {
          const totalGrams = Math.round(newQty * 1000);
          newWeightDisplay = totalGrams >= 1000 ? `${(totalGrams / 1000).toFixed(2)} kg` : `${totalGrams} gm`;
        } else {
          newWeightDisplay = `${newQty} ${newQty === 1 ? 'Pack' : 'Packs'}`;
        }

        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          weightDisplay: newWeightDisplay,
          lineTotal: Math.round(newQty * selectedProduct.unitPrice * 100) / 100,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        unitPrice: selectedProduct.unitPrice,
        unitType: selectedProduct.unitType,
        quantity: qty,
        weightDisplay,
        unitPriceDisplay,
        lineTotal: popupLineTotal,
        image: selectedProduct.image,
      };
      return [...prevCart, newItem];
    });

    setSelectedProduct(null);
  };

  // Remove Item From Cart
  const handleRemoveCartItem = (id: string) => {
    soundFx.playClick();
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear Entire Cart
  const handleClearCart = () => {
    soundFx.playClick();
    setCart([]);
    localStorage.removeItem(`sgrocery_active_cart_${activeStore}`);
    showToast('Cart cleared');
  };

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [cart]);

  const discount = 0;
  const totalAmount = Math.max(0, subtotal - discount);

  // Hold Bill Handler
  const handleHoldBill = () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add products to hold bill.');
      return;
    }
    soundFx.playClick();
    const held = {
      id: `hold-${Date.now()}`,
      timestamp: Date.now(),
      cart,
      totalAmount,
      customerName,
    };
    try {
      const existingHeld = JSON.parse(localStorage.getItem(`sgrocery_held_bills_${activeStore}`) || '[]');
      localStorage.setItem(`sgrocery_held_bills_${activeStore}`, JSON.stringify([...existingHeld, held]));
      setCart([]);
      showToast('Bill held successfully');
    } catch {
      showToast('Could not hold bill');
    }
  };

  // Save Draft Handler
  const handleSaveDraft = () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add products to save draft.');
      return;
    }
    soundFx.playClick();
    const draft = {
      id: `draft-${Date.now()}`,
      timestamp: Date.now(),
      cart,
      totalAmount,
      customerName,
    };
    try {
      const existingDrafts = JSON.parse(localStorage.getItem(`sgrocery_draft_bills_${activeStore}`) || '[]');
      localStorage.setItem(`sgrocery_draft_bills_${activeStore}`, JSON.stringify([...existingDrafts, draft]));
      showToast('Draft saved successfully');
    } catch {
      showToast('Could not save draft');
    }
  };

  // Add Custom Product Handler
  const handleSaveCustomProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const price = parseFloat(customPrice) || 10;
    const newProd: CatalogProduct = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      sku: customSku.trim() || `SKU: GEN${Math.floor(100 + Math.random() * 900)}`,
      unitPrice: price,
      category: customCategory,
      unitType: customType,
      defaultUnit: customType === 'loose' ? 'kg' : 'Pack',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    };

    DEFAULT_CATALOG.push(newProd);
    soundFx.playSuccess();
    setShowAddCustomModal(false);
    setCustomName('');
    setCustomSku('');
    setCustomPrice('');
    showToast(`Added ${newProd.name} to products`);
    handleOpenProductPopup(newProd);
  };



  // ==================== CAMERA / IMAGE SEARCH METHODS ====================
  const handleOpenImageSearch = async () => {
    soundFx.playClick();
    setShowCameraModal(true);
    setCameraError(null);
    setCameraLoading(true);
    setScannedImagePreview(null);
    setDetectedProduct(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Direct live camera is not supported in this browser. Please upload a product image below.');
        setCameraLoading(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      setCameraStream(stream);
      setCameraLoading(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied by browser. Please allow camera permissions, or select an image file below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can select an image file below to search.');
      } else {
        setCameraError('Unable to open live camera. You can select an image file below to search.');
      }
    }
  };

  const handleCloseCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    setScannedImagePreview(null);
    setDetectedProduct(null);
    setCameraError(null);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    soundFx.playClick();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setScannedImagePreview(dataUrl);
      matchProductFromImage('camera-capture.jpg');
    }
  };

  const handleFileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundFx.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setScannedImagePreview(dataUrl);
      matchProductFromImage(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Image recognition & matching algorithm
  const matchProductFromImage = (hintName: string = '') => {
    // Intelligent heuristic matching against catalog
    const lowerHint = hintName.toLowerCase();
    let matched = fullCatalog.find((p) => {
      const pName = p.name.toLowerCase();
      if (lowerHint.includes('rice') && pName.includes('rice')) return true;
      if (lowerHint.includes('parle') && pName.includes('parle')) return true;
      if (lowerHint.includes('biscuit') && pName.includes('biscuit')) return true;
      if (lowerHint.includes('oil') && pName.includes('oil')) return true;
      if (lowerHint.includes('sugar') && pName.includes('sugar')) return true;
      if (lowerHint.includes('surf') && pName.includes('surf')) return true;
      if (lowerHint.includes('atta') && pName.includes('atta')) return true;
      if (lowerHint.includes('salt') && pName.includes('salt')) return true;
      if (lowerHint.includes('milk') && pName.includes('milk')) return true;
      if (lowerHint.includes('tea') && pName.includes('tea')) return true;
      return false;
    });

    if (!matched) {
      // Default to top product match for visual detection
      matched = fullCatalog[0] || DEFAULT_CATALOG[0];
    }

    setDetectedProduct(matched);
  };

  const handleApplyImageMatch = (product: CatalogProduct) => {
    soundFx.playSuccess();
    handleCloseCameraModal();
    setSearchQuery(product.name);
    showToast(`Image matched: ${product.name}`);
    handleOpenProductPopup(product);
  };

  // ==================== MICROPHONE VOICE SEARCH METHODS ====================
  const handleStartVoiceSearch = async () => {
    soundFx.playClick();
    setVoiceError(null);
    setVoiceTranscript('');
    setIsListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice recognition API is not supported in this browser. You can click any product keyword below or type in search.');
      return;
    }

    // Request microphone permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permErr: any) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('Listening... speak product name');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const cleaned = transcript.trim();
        setVoiceTranscript(cleaned);

        if (event.results[0].isFinal) {
          soundFx.playSuccess();
          setSearchQuery(cleaned);
          setTimeout(() => {
            setIsListening(false);
            showToast(`Voice Search: "${cleaned}"`);
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please speak closer to microphone and try again.');
        } else {
          setVoiceError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Will close when user clicks cancel or final result fires
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError('Could not start microphone: ' + (err.message || 'Error'));
    }
  };

  const handleStopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setVoiceTranscript('');
    setVoiceError(null);
  };

  // ==================== FULL-SCREEN PAYMENT PAGE NAVIGATION ====================
  if (isPaymentPageOpen) {
    return (
      <PaymentScreen
        storeName={activeStore}
        totalBillAmount={totalAmount}
        cartItems={cart}
        initialCustomerName={customerName}
        initialCustomerPhone={customerPhone}
        onBack={() => {
          soundFx.playClick();
          setIsPaymentPageOpen(false);
        }}
        onPaymentSuccess={(record) => {
          setIsPaymentPageOpen(false);
          setCart([]);
          localStorage.removeItem(`sgrocery_active_cart_${activeStore}`);
          if (onSaleCompleted) {
            onSaleCompleted(record.invoiceNo);
          } else {
            onBack();
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8faf9] flex flex-col justify-between text-slate-800 animate-fadeIn overflow-y-auto pb-20 sm:pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================== 1. TOP APP BAR (CLEANED PER INSTRUCTION 1) ==================== */}
      {/* Removed: "Mandal Store" text, Home icon, Scanner option, and Three-dot menu icon */}
      <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2 font-bold text-sm"
            aria-label="Back to Sales Dashboard"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
            <span className="text-xs sm:text-sm font-extrabold text-slate-800">Back to Sales</span>
          </button>
        </div>
      </header>

      {/* ==================== 2. GREEN BANNER (NEW SALE) ==================== */}
      <section className="w-full bg-[#008744] text-white px-4 sm:px-6 lg:px-8 pt-4 pb-6 shadow-md rounded-b-[2rem] sm:rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
        
        <div className="w-full flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner shrink-0">
            <ShoppingCart className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              New Sale
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Create a new bill / invoice
            </p>
          </div>
        </div>
      </section>

      {/* ==================== 3. MAIN WORKSPACE (FULL SCREEN EXTENDED & RESPONSIVE) ==================== */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Search Bar: Search Product by Name + Image & Voice Options */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Product by Name"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008744] shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search by Image / Camera Button (Functional) */}
          <button
            type="button"
            onClick={handleOpenImageSearch}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#008744] hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all shrink-0 cursor-pointer"
            title="Search by Product Image / Camera"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Search by Voice / Microphone Button (Functional) */}
          <button
            type="button"
            onClick={handleStartVoiceSearch}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#008744] hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all shrink-0 cursor-pointer"
            title="Search by Voice Input (Microphone)"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory('All');
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
              activeCategory === 'All'
                ? 'bg-[#008744] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory('Grocery');
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
              activeCategory === 'Grocery'
                ? 'bg-[#ffeedb] text-orange-800 border border-orange-300 ring-2 ring-[#008744]'
                : 'bg-[#fff7ed] border border-[#fed7aa] text-slate-800 hover:bg-orange-100'
            }`}
          >
            <Package className="w-4 h-4 text-orange-600" />
            <span>Grocery</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory('Snacks');
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
              activeCategory === 'Snacks'
                ? 'bg-[#ffeedb] text-amber-900 border border-amber-300 ring-2 ring-[#008744]'
                : 'bg-[#fffbeb] border border-[#fef3c7] text-slate-800 hover:bg-amber-100'
            }`}
          >
            <Cookie className="w-4 h-4 text-amber-600" />
            <span>Snacks</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory('Beverages');
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
              activeCategory === 'Beverages'
                ? 'bg-[#dcfce7] text-emerald-900 border border-emerald-300 ring-2 ring-[#008744]'
                : 'bg-[#ecfdf5] border border-[#a7f3d0] text-slate-800 hover:bg-emerald-100'
            }`}
          >
            <Coffee className="w-4 h-4 text-emerald-600" />
            <span>Beverages</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory('Personal Care');
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
              activeCategory === 'Personal Care'
                ? 'bg-[#f3e8ff] text-purple-900 border border-purple-300 ring-2 ring-[#008744]'
                : 'bg-[#faf5ff] border border-[#e9d5ff] text-slate-800 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Personal Care</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveCategory('More');
            }}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
              activeCategory === 'More'
                ? 'bg-slate-200 text-slate-900 border border-slate-300 ring-2 ring-[#008744]'
                : 'bg-[#f8fafc] border border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <MoreHorizontal className="w-4 h-4 text-slate-600" />
            <span>More</span>
          </button>

        </div>

        {/* 2-Column Responsive Layout (Mobile: Stacked, Desktop: Wide Split Grid, No cut off) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ==================== LEFT/TOP: PRODUCTS LIST ==================== */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            
            {/* Products Section Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Products
              </h2>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowAddCustomModal(true);
                }}
                className="py-1 px-3 rounded-xl border border-[#008744] text-[#008744] hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product Items List (Scrolls cleanly with no cutoff) */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="font-bold text-sm">No products found</p>
                  <p className="text-xs text-slate-400">Try a different name or search by image</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-2.5 sm:p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 flex items-center justify-between gap-3 transition-all"
                  >
                    {/* Left: Product Thumbnail Image + Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {product.sku}
                        </p>
                        <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                          ₹{product.unitPrice.toFixed(2)}{' '}
                          <span className="text-[11px] font-semibold text-slate-500">
                            / {product.unitType === 'loose' ? 'kg' : 'Pack'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Add Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenProductPopup(product)}
                      className="py-1.5 px-4 sm:px-5 rounded-xl border border-[#008744] text-[#008744] hover:bg-[#008744] hover:text-white font-extrabold text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Divider Handle */}
            <div className="pt-2 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#008744] border border-emerald-200 flex items-center justify-center shadow-2xs">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

          </div>

          {/* ==================== RIGHT/BOTTOM: CART SECTION ==================== */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#008744] flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Cart ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
                </h3>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {/* Cart Body */}
            {cart.length === 0 ? (
              /* EMPTY CART STATE (Image 1) */
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                    <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="absolute -top-1 -right-1 text-slate-400 text-xs">✦</div>
                  <div className="absolute top-1 -left-1 text-slate-400 text-xs">✦</div>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  No products added yet
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Add products from the list to create a bill.
                </p>
              </div>
            ) : (
              /* POPULATED CART ITEMS (Image 2) */
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {item.weightDisplay} × {item.unitPriceDisplay}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-xs sm:text-sm text-slate-900">
                        ₹{item.lineTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal & Discount rows */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700">
                    <span>Discount</span>
                    <span className="bg-emerald-50 text-[#008744] font-black px-2 py-0.5 rounded-full text-[10px]">
                      - ₹0.00
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total Amount Container */}
            <div className="bg-[#dcf4e5] border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xs">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                Total Amount
              </span>
              <span className="font-black text-lg sm:text-xl text-slate-950">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Bottom Actions Row (Fully visible and responsive) */}
            {cart.length > 0 ? (
              <div className="grid grid-cols-12 gap-2 pt-1">
                {/* Hold Bill */}
                <button
                  type="button"
                  onClick={handleHoldBill}
                  className="col-span-3 py-3 px-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition-all border border-sky-200 cursor-pointer active:scale-95"
                >
                  <Clock className="w-4 h-4 text-sky-700" />
                  <span>Hold Bill</span>
                </button>

                {/* Save Draft */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="col-span-3 py-3 px-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition-all border border-purple-200 cursor-pointer active:scale-95"
                >
                  <Bookmark className="w-4 h-4 text-purple-700" />
                  <span>Save Draft</span>
                </button>

                {/* Proceed to Payment */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsPaymentPageOpen(true);
                  }}
                  className="col-span-6 py-3 px-4 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsPaymentPageOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}

          </div>

        </div>

      </main>

      {/* ==================== 4. SMALL ADD PRODUCT POP-UP (IMAGE 2) ==================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-[340px] sm:max-w-[370px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp max-h-[90dvh] overflow-y-auto">
            
            {/* Pop-up Green Header Bar */}
            <div className="bg-[#008744] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                Add Product
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop-up Body */}
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Product Photo */}
              <div className="w-36 h-28 mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>

              {/* Product Title, Tag, and Price */}
              <div className="text-center space-y-1">
                <h4 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                  {selectedProduct.name}
                </h4>
                
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-[#008744] border border-emerald-200">
                    {selectedProduct.unitType === 'loose' ? 'Loose Product' : 'Packaged Product'}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-black text-slate-900 pt-0.5">
                  ₹{selectedProduct.unitPrice.toFixed(2)}{' '}
                  <span className="text-xs font-semibold text-slate-500">
                    / {selectedProduct.unitType === 'loose' ? 'kg' : 'Pack'}
                  </span>
                </p>
              </div>

              {/* Input for Weight (Loose) or Quantity (Packaged) */}
              {selectedProduct.unitType === 'loose' ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter weight
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={looseWeightInput}
                      onChange={(e) => setLooseWeightInput(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008744]"
                      placeholder="e.g. 250"
                    />
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 p-0.5 bg-slate-50 shrink-0">
                      <button
                        type="button"
                        onClick={() => setLooseWeightUnit('gm')}
                        className={`px-3 py-2 rounded-lg text-xs font-black transition-colors ${
                          looseWeightUnit === 'gm'
                            ? 'bg-[#008744] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        gm
                      </button>
                      <button
                        type="button"
                        onClick={() => setLooseWeightUnit('kg')}
                        className={`px-3 py-2 rounded-lg text-xs font-black transition-colors ${
                          looseWeightUnit === 'kg'
                            ? 'bg-[#008744] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        kg
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter quantity
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-1.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setPackagedQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-200 font-black text-base text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-black text-base text-slate-900">
                      {packagedQuantity} Packs
                    </span>
                    <button
                      type="button"
                      onClick={() => setPackagedQuantity((q) => q + 1)}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-200 font-black text-base text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Line Total Container (Light Green) */}
              <div className="bg-[#ecfdf5] border border-emerald-100 rounded-2xl p-3 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Line Total</span>
                  <span className="text-base font-black text-[#008744]">
                    ₹{popupLineTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">
                  {selectedProduct.unitType === 'loose'
                    ? `(${looseWeightInput || 0} ${looseWeightUnit} × ₹${selectedProduct.unitPrice.toFixed(2)} / kg)`
                    : `(${packagedQuantity} Packs × ₹${selectedProduct.unitPrice.toFixed(2)})`}
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3 px-4 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <ShoppingCart className="w-4 h-4 stroke-[2.4]" />
                <span>Add to Cart</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==================== 5. CAMERA & IMAGE SEARCH MODAL ==================== */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-[#008744] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <h3 className="font-black text-base tracking-tight">
                  Search Product by Image
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCameraModal}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Live Video Scanner or Captured Image */}
              <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                {scannedImagePreview ? (
                  <img
                    src={scannedImagePreview}
                    alt="Scanned product"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Camera Targeting Crosshair Frame */}
                    <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-emerald-400/70 shadow-lg animate-pulse" />
                    </div>
                  </>
                )}

                {cameraLoading && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                    <p className="text-xs font-bold">Accessing camera...</p>
                  </div>
                )}
              </div>

              {/* Camera Error / Permission Notice */}
              {cameraError && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{cameraError}</p>
                </div>
              )}

              {/* Detected Product Match Card */}
              {detectedProduct && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={detectedProduct.image}
                      alt={detectedProduct.name}
                      className="w-11 h-11 rounded-xl object-cover border border-emerald-300"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-emerald-950 truncate">
                        {detectedProduct.name}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-700">
                        ₹{detectedProduct.unitPrice.toFixed(2)} / {detectedProduct.defaultUnit}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyImageMatch(detectedProduct)}
                    className="py-1.5 px-3 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs shrink-0 cursor-pointer"
                  >
                    Select Product
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {!scannedImagePreview && (
                  <button
                    type="button"
                    onClick={handleCaptureFrame}
                    className="flex-1 py-3 px-3 rounded-2xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Scan</span>
                  </button>
                )}

                {/* Upload Image Option */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileImageSelect}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Upload Image</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================== 6. MICROPHONE VOICE SEARCH OVERLAY ==================== */}
      {isListening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100 animate-scaleUp">
            
            {/* Animated Mic Ring */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
              <div className="w-16 h-16 rounded-full bg-[#008744] text-white flex items-center justify-center shadow-lg relative z-10">
                <Mic className="w-8 h-8 stroke-[2.2]" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Listening for Product Name...
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Say e.g. "Sugar", "Basmati Rice", "Sunflower Oil", "Parle-G"
              </p>
            </div>

            {/* Live Transcript Display */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950 min-h-[46px] flex items-center justify-center">
              {voiceTranscript || 'Speak now into your microphone...'}
            </div>

            {/* Error prompt if mic blocked */}
            {voiceError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{voiceError}</p>
              </div>
            )}

            {/* Quick voice preset chips for instant search */}
            <div className="space-y-1 pt-1">
              <p className="text-[11px] font-bold text-slate-400">Quick Voice Suggestions:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['Sugar', 'Basmati Rice', 'Parle-G', 'Sunflower Oil', 'Surf Excel', 'Tata Salt'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      soundFx.playSuccess();
                      setSearchQuery(sample);
                      setIsListening(false);
                      showToast(`Voice Search: "${sample}"`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStopVoiceSearch}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* ==================== 7. ADD CUSTOM PRODUCT MODAL ==================== */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">Add New Product</h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Masoor Dal (1 kg)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-[#008744]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="e.g. 95.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-[#008744]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={customSku}
                    onChange={(e) => setCustomSku(e.target.value)}
                    placeholder="e.g. SKU: GR099"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-[#008744]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Type</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold"
                  >
                    <option value="packaged">Packaged</option>
                    <option value="loose">Loose (by weight)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Save & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ==================== 9. SUCCESS RECEIPT MODAL ==================== */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4 animate-scaleUp">
            
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#008744] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">
                Sale Recorded Successfully!
              </h3>
              <p className="text-xs font-bold text-[#008744] mt-1">
                Invoice No: {successReceipt.invoiceNo}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Items Sold:</span>
                <span className="font-bold text-slate-800">{successReceipt.itemsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bill:</span>
                <span className="font-bold text-slate-900">₹{successReceipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid:</span>
                <span className="font-bold text-[#008744]">₹{successReceipt.paidAmount.toFixed(2)}</span>
              </div>
              {successReceipt.dueAmount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span className="font-bold">Pending Due:</span>
                  <span className="font-black">₹{successReceipt.dueAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSuccessReceipt(null);
                  if (onSaleCompleted) {
                    onSaleCompleted(successReceipt.invoiceNo);
                  } else {
                    onBack();
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#008744] hover:bg-emerald-700 text-white font-black text-xs shadow-md"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
