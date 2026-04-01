import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  MessageCircle,
  User,
  Settings,
  MapPin,
  Search,
  Image as ImageIcon,
  MoreHorizontal,
  Heart,
  Share2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe,
  Bell,
  PlusSquare,
  Users,
  Briefcase,
  X,
  ImagePlus,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Star,
  ArrowLeft,
  Send,
  Minimize2,
  Maximize2,
  Menu,
  Bookmark,
  LogOut,
  Camera,
  IdCard,
  Calendar,
  BadgeCheck,
} from "lucide-react";

// --- FIREBASE BACKEND IMPORTS ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- FIREBASE INITIALIZATION ---
let firebaseConfig;
if (typeof __firebase_config !== "undefined" && __firebase_config) {
  // Uses the internal keys if testing inside the Canvas
  firebaseConfig = JSON.parse(__firebase_config);
} else {
  // Uses your live keys when running externally
  firebaseConfig = {
    apiKey: "AIzaSyCDfroyNybGFudf7JF4LgoQb0DeKR_LvXw",
    authDomain: "stayup-6536c.firebaseapp.com",
    projectId: "stayup-6536c",
    storageBucket: "stayup-6536c.firebasestorage.app",
    messagingSenderId: "892048994538",
    appId: "1:892048994538:web:f0823ee82fe2780280e793",
    measurementId: "G-G32E6H1361",
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Locked to a universal ID so WordPress, CodeSandbox, and Canvas all share the exact same posts
const appId = "stayup-global-production";

// --- DATA ---
const EUROPEAN_REGIONS = [
  {
    name: "Spain",
    cities: ["Barcelona", "Madrid", "Valencia", "Malaga", "Seville"],
  },
  { name: "Germany", cities: ["Berlin", "Hamburg", "Munich", "Frankfurt"] },
  {
    name: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
  },
  { name: "Sweden", cities: ["Stockholm", "Gothenburg", "Malmo"] },
  { name: "Portugal", cities: ["Lisbon", "Porto", "Algarve"] },
  { name: "France", cities: ["Paris", "Marseille", "Lyon"] },
  { name: "Poland", cities: ["Warsaw", "Krakow", "Gdansk"] },
  { name: "Italy", cities: ["Rome", "Milan", "Florence"] },
  { name: "Belgium", cities: ["Brussels", "Antwerp", "Ghent"] },
  { name: "Austria", cities: ["Vienna", "Salzburg"] },
];

const StayUpLogo = () => (
  <div className="flex items-center justify-center h-12 gap-2">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E11D48"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
    <div className="hidden sm:flex flex-col leading-none">
      <span className="text-xl font-black tracking-tighter text-black">
        STAY<span className="text-[#E11D48]">UP</span>
      </span>
      <span className="text-[8px] font-bold text-gray-500 uppercase">
        Rental Platform
      </span>
    </div>
  </div>
);

export default function App() {
  // --- INJECT TAILWIND CSS FOR CODESANDBOX/WORDPRESS ---
  useEffect(() => {
    if (!window.tailwind && !document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const [selectedCity, setSelectedCity] = useState("Barcelona");
  const [expandedCountries, setExpandedCountries] = useState(["Spain"]);
  const [activeTab, setActiveTab] = useState("home");

  const [postType, setPostType] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);

  // --- Auth & DB State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Registration States
  const [regName, setRegName] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const defaultUserTemplate = {
    name: "New User",
    bio: "Hi! I am new here.",
    avatar: "https://i.pravatar.cc/150?u=newuser",
    type: "tenant",
    isIDVerified: false,
    verifiedOwnership: false,
    joined: "Just now",
  };

  const [userData, setUserData] = useState(defaultUserTemplate);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentProfileView, setCurrentProfileView] = useState(null);

  const [activeChat, setActiveChat] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lightbox State (supports multiple images)
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    media: [],
    index: 0,
  });

  const [landlordMedia, setLandlordMedia] = useState([]);
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [billsFlexible, setBillsFlexible] = useState(false);
  const [depositDiscussLater, setDepositDiscussLater] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [tenantDesc, setTenantDesc] = useState("");
  const [tenantBudget, setTenantBudget] = useState("");
  const [tenantRoomType, setTenantRoomType] = useState("Shared Room");
  const [tenantPrefs, setTenantPrefs] = useState([]);

  const [landlordDesc, setLandlordDesc] = useState("");
  const [landlordRent, setLandlordRent] = useState("");
  const [landlordRoomType, setLandlordRoomType] = useState("Private Room");
  const [landlordBeds, setLandlordBeds] = useState("");
  const [landlordBaths, setLandlordBaths] = useState("");
  const [landlordAmenitiesList, setLandlordAmenitiesList] = useState([]);

  const [posts, setPosts] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const chatEndRef = useRef(null);

  // --- FIREBASE EFFECTS ---
  useEffect(() => {
    let isMounted = true;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setCurrentUser(user);
        setIsLoggedIn(!!user);
        if (user) {
          // Sync specific profile info down from Firebase securely
          setUserData((prev) => ({
            ...prev,
            name: user.displayName || prev.name,
            avatar:
              user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
          }));
        }
        setIsAuthReady(true);
      }
    });
    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    // Listen for Posts
    const postsQuery = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "posts"
    );
    const unsubscribePosts = onSnapshot(
      postsQuery,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetchedPosts.sort((a, b) => b.time - a.time);
        setPosts(fetchedPosts);
        setIsDbConnected(true);
      },
      (error) => console.error("Error fetching posts:", error)
    );

    // Listen for Favorites
    const favQuery = collection(
      db,
      "artifacts",
      appId,
      "users",
      currentUser.uid,
      "favorites"
    );
    const unsubscribeFavs = onSnapshot(
      favQuery,
      (snapshot) => {
        const fetchedFavs = snapshot.docs.map((doc) => doc.data().postId);
        setFavorites(fetchedFavs);
      },
      (error) => console.error("Error fetching favorites:", error)
    );

    // Listen for All Global Messages
    const msgQuery = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "messages"
    );
    const unsubscribeMsgs = onSnapshot(
      msgQuery,
      (snapshot) => {
        const fetchedMsgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetchedMsgs.sort((a, b) => a.timestamp - b.timestamp);
        setAllMessages(fetchedMsgs);
      },
      (error) => console.error("Error fetching messages:", error)
    );

    return () => {
      unsubscribePosts();
      unsubscribeFavs();
      unsubscribeMsgs();
    };
  }, [isAuthReady, currentUser]);

  // Automatically mark messages as "read" when the chat is open
  useEffect(() => {
    if (activeChat && currentUser && isLoggedIn) {
      const unreadMsgs = allMessages.filter(
        (m) =>
          m.receiver === currentUser.uid &&
          m.sender === activeChat.uid &&
          !m.read
      );
      unreadMsgs.forEach(async (msg) => {
        try {
          await updateDoc(
            doc(db, "artifacts", appId, "public", "data", "messages", msg.id),
            { read: true }
          );
        } catch (e) {
          console.error("Error marking message as read:", e);
        }
      });
    }
  }, [activeChat, allMessages, currentUser, isLoggedIn]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, activeChat]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const resetToHome = () => {
    setCurrentProfileView(null);
    setActiveTab("home");
    setPostType(null);
    setEditingPostId(null);
    setIsInboxOpen(false);
    setIsMobileMenuOpen(false);
  };

  // --- REAL AUTHENTICATION LOGIC ---
  const handleLoginAction = async () => {
    if (!loginEmail || !loginPassword) {
      showToast("Please enter email and password");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const user = userCred.user;
      const displayName = user.displayName || loginEmail.split("@")[0];
      setUserData((prev) => ({
        ...prev,
        name: displayName,
        avatar: user.photoURL || `https://i.pravatar.cc/150?u=${loginEmail}`,
      }));
      setIsLoggedIn(true);
      showToast(`Welcome back, ${displayName}!`);
    } catch (e) {
      if (e.code === "auth/operation-not-allowed")
        showToast("Action required: Enable Email/Password Auth in Firebase");
      else showToast("Invalid email or password");
    }
  };

  const handleRegisterAction = async () => {
    if (!regName || !regEmail || !regPassword || !regDob) {
      showToast("Please fill in all fields");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        regEmail,
        regPassword
      );
      const defaultAvatar = `https://i.pravatar.cc/150?u=${regEmail}`;

      // Save Name and default Avatar directly to Firebase Account
      await updateProfile(userCred.user, {
        displayName: regName,
        photoURL: defaultAvatar,
      });

      setUserData((prev) => ({
        ...prev,
        name: regName,
        avatar: defaultAvatar,
      }));
      setIsLoggedIn(true);
      showToast(`Welcome, ${regName}!`);
    } catch (e) {
      if (e.code === "auth/operation-not-allowed")
        showToast("Action required: Enable Email/Password Auth in Firebase");
      else if (e.code === "auth/email-already-in-use")
        showToast("Email already registered. Please log in.");
      else if (e.code === "auth/weak-password")
        showToast("Password must be at least 6 characters.");
      else showToast("Signup error: " + e.code);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(defaultUserTemplate); // Clear local memory to prevent cross-account bugs
      setLoginEmail("");
      setLoginPassword("");
      showToast("Logged out successfully");
      resetToHome();
    } catch (error) {
      showToast("Error logging out");
    }
  };

  // --- PROFILE PICTURE UPLOAD WITH FIREBASE STORAGE ---
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file && currentUser) {
      showToast("Uploading profile picture...");
      try {
        const storageRef = ref(
          storage,
          `avatars/${currentUser.uid}_${Date.now()}`
        );
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        // Save the new Avatar URL permanently to Firebase Account
        await updateProfile(currentUser, { photoURL: downloadUrl });

        setUserData((prev) => ({ ...prev, avatar: downloadUrl }));
        showToast("Profile picture updated!");
      } catch (error) {
        showToast(
          "Error uploading picture. Check your Firebase Storage Rules!"
        );
      }
    }
  };

  const toggleCountry = (name) =>
    setExpandedCountries((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCurrentProfileView(null);
    setIsMobileMenuOpen(false);
    setPostType(null);
    setEditingPostId(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        url: URL.createObjectURL(file), // Used just for local preview
        file: file, // Used to upload to Firebase securely
        type: file.type.startsWith("video/") ? "video" : "image",
        caption: "",
      }));
      setLandlordMedia((prev) => [...prev, ...filesArray]);
    }
  };

  const removeMedia = (id) =>
    setLandlordMedia((prev) => prev.filter((m) => m.id !== id));
  const updateCaption = (id, text) =>
    setLandlordMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, caption: text } : m))
    );

  const handlePostSubmit = async () => {
    if (!isLoggedIn || !currentUser) {
      showToast("You must be logged in to post.");
      return;
    }

    setIsUploading(true);
    showToast("Saving post... Please wait.");

    try {
      // 1. Upload the files securely to Firebase Storage
      const uploadedMediaUrls = [];
      for (const m of landlordMedia) {
        if (m.file) {
          const uniqueId = Math.random().toString(36).substring(7);
          const storageRef = ref(
            storage,
            `properties/${currentUser.uid}_${Date.now()}_${uniqueId}_${
              m.file.name
            }`
          );
          await uploadBytes(storageRef, m.file);
          const downloadUrl = await getDownloadURL(storageRef);
          uploadedMediaUrls.push(downloadUrl);
        } else {
          uploadedMediaUrls.push(m.url); // Keep existing URLs if we are just editing a post
        }
      }

      // 2. Save the listing data
      const postData = {
        author: userData.name,
        authorUid: currentUser.uid,
        time: Date.now(),
        city: selectedCity,
        type: postType,
        img: userData.avatar,
        content: postType === "tenant" ? tenantDesc : landlordDesc,
        budget: tenantBudget || "",
        price: landlordRent || "",
        status: "available",
        roomType: postType === "tenant" ? tenantRoomType : landlordRoomType,
        beds: landlordBeds,
        baths: landlordBaths,
        dateFrom: dateFrom,
        dateTo: dateTo,
        isLongTerm: isLongTerm,
        features: postType === "tenant" ? tenantPrefs : landlordAmenitiesList,
        billsFlexible: billsFlexible,
        depositDiscussLater: depositDiscussLater,
        media: uploadedMediaUrls,
      };

      if (editingPostId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "posts", editingPostId),
          postData
        );
        showToast("Listing updated and renewed!");
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "posts"),
          postData
        );
        showToast("Listing saved to the live database!");
      }

      setPostType(null);
      setEditingPostId(null);
      setTenantDesc("");
      setLandlordDesc("");
      setLandlordMedia([]);
      setDateFrom("");
      setDateTo("");
      setIsLongTerm(false);
    } catch (err) {
      console.error(err);
      showToast(
        "Error saving post! Make sure Firebase Storage Rules are enabled."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const changePostStatus = async (postId, newStatus) => {
    if (!isLoggedIn || !currentUser) return;
    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "posts", postId),
        { status: newStatus }
      );
      showToast(`Listing marked as ${newStatus}`);
    } catch (err) {
      showToast("Error updating status.");
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((p) => p.id === postId);
    if (!postToEdit) return;

    setEditingPostId(postToEdit.id);
    setPostType(postToEdit.type);
    setSelectedCity(postToEdit.city);
    setCurrentProfileView(null);

    if (postToEdit.type === "tenant") {
      setTenantDesc(postToEdit.content || "");
      setTenantBudget(postToEdit.budget || "");
      setTenantRoomType(postToEdit.roomType || "Shared Room");
      setTenantPrefs(postToEdit.features || []);
    } else {
      setLandlordDesc(postToEdit.content || "");
      setLandlordRent(postToEdit.price || "");
      setLandlordRoomType(postToEdit.roomType || "Private Room");
      setLandlordBeds(postToEdit.beds || "");
      setLandlordBaths(postToEdit.baths || "");
      setLandlordAmenitiesList(postToEdit.features || []);
      setBillsFlexible(postToEdit.billsFlexible || false);
      setDepositDiscussLater(postToEdit.depositDiscussLater || false);

      const mediaList = (postToEdit.media || []).map((url) => ({
        id: Math.random().toString(36).substring(7),
        url: url,
        type: "image",
        caption: "",
      }));
      setLandlordMedia(mediaList);
    }

    setDateFrom(postToEdit.dateFrom || "");
    setDateTo(postToEdit.dateTo || "");
    setIsLongTerm(postToEdit.isLongTerm || false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePost = async (postId) => {
    if (!isLoggedIn || !currentUser) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "posts", postId)
      );
      showToast("Post removed from database.");
    } catch (err) {
      showToast("Error removing post.");
    }
  };

  const toggleFavorite = async (post) => {
    if (!isLoggedIn || !currentUser) {
      showToast("Login required.");
      return;
    }
    const isFav = favorites.includes(post.id);
    const favRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      currentUser.uid,
      "favorites",
      post.id
    );
    try {
      if (isFav) {
        await deleteDoc(favRef);
        showToast("Removed from favorites");
      } else {
        await setDoc(favRef, { postId: post.id });
        showToast("Saved to favorites!");
      }
    } catch (err) {
      showToast("Error updating favorites.");
    }
  };

  const openProfile = (user, isOwn = false) => {
    if (!isLoggedIn && isOwn) {
      showToast("Please log in first");
      return;
    }
    if (isOwn) {
      setCurrentProfileView({ ...userData, isOwn: true, reviews: [] });
    } else {
      const isLandlord = user.type === "landlord";
      setCurrentProfileView({
        ...user,
        name: user.author,
        avatar: user.img,
        about: isLandlord ? "Professional landlord." : "New expat in town.",
        verifiedIdentity: user.verifiedIdentity || false,
        verifiedOwnership: isLandlord,
        joined: "Jan 2026",
        rating: 4.5,
        reviews: [],
        isOwn: false,
        uid: user.uid, // Ensure we pass the UID for messaging
      });
    }
    setPostType(null);
    setEditingPostId(null);
  };

  // --- REAL-TIME MESSAGING ---
  const handleStartChat = (targetUser) => {
    if (!isLoggedIn) {
      showToast("Please log in first");
      return;
    }
    setActiveChat({
      uid: targetUser.uid || targetUser.authorUid,
      name: targetUser.name || targetUser.author,
      avatar: targetUser.avatar || targetUser.img,
      status: "open",
    });
    setIsInboxOpen(false);
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || !activeChat || !currentUser) return;
    const textMsg = currentInput.trim();
    setCurrentInput(""); // Clear input instantly for snappy UX

    const newMsg = {
      participants: [currentUser.uid, activeChat.uid],
      sender: currentUser.uid,
      senderName: userData.name,
      senderImg: userData.avatar,
      receiver: activeChat.uid,
      receiverName: activeChat.name,
      receiverImg: activeChat.avatar,
      text: textMsg,
      timestamp: Date.now(),
      read: false, // Message is marked as unread initially
    };

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "messages"),
        newMsg
      );
    } catch (err) {
      console.error(err);
      showToast("Error sending message.");
    }
  };

  // Derive Current Chat Messages
  const currentChatMessages = allMessages.filter(
    (m) =>
      m.participants &&
      m.participants.includes(currentUser?.uid) &&
      m.participants.includes(activeChat?.uid)
  );

  // Derive Inbox Recent Chats & Badges
  const totalUnreadMessages = allMessages.filter(
    (m) => m.receiver === currentUser?.uid && m.read === false
  ).length;

  const derivedRecentChats = (() => {
    if (!currentUser) return [];
    const myMessages = allMessages.filter(
      (m) => m.participants && m.participants.includes(currentUser.uid)
    );
    const chatMap = {};

    myMessages.forEach((m) => {
      const otherUid = m.sender === currentUser.uid ? m.receiver : m.sender;
      const otherName =
        m.sender === currentUser.uid ? m.receiverName : m.senderName;
      const otherImg =
        m.sender === currentUser.uid ? m.receiverImg : m.senderImg;

      if (!chatMap[otherUid] || chatMap[otherUid].timestamp < m.timestamp) {
        // Check if there are any unread messages FROM this specific user
        const unreadCountFromUser = myMessages.filter(
          (msg) =>
            msg.sender === otherUid &&
            msg.receiver === currentUser.uid &&
            !msg.read
        ).length;

        chatMap[otherUid] = {
          uid: otherUid,
          author: otherName,
          img: otherImg,
          lastMsg: m.text,
          timestamp: m.timestamp,
          time: getTimeAgo(m.timestamp),
          unread: unreadCountFromUser > 0,
        };
      }
    });
    return Object.values(chatMap).sort((a, b) => b.timestamp - a.timestamp);
  })();

  const generateAIDescription = async (type) => {
    setIsGeneratingAI(true);

    // ⚠️ IMPORTANT: PASTE YOUR OWN GOOGLE AI STUDIO API KEY BELOW
    const apiKey = ""; // <--- PASTE YOUR GEMINI API KEY HERE

    // Fallback logic to grab the key if we are testing safely inside the Canvas editor
    const effectiveKey =
      apiKey ||
      (typeof __gemini_api_key !== "undefined" ? __gemini_api_key : "");

    if (!effectiveKey) {
      showToast(
        "Missing API Key! Paste your Gemini API key in the code around line 470."
      );
      setIsGeneratingAI(false);
      return;
    }

    try {
      let prompt =
        type === "tenant"
          ? `Write a conversational 3-sentence post looking for a ${tenantRoomType} in ${selectedCity}. Budget: €${tenantBudget}. Prefs: ${tenantPrefs.join(
              ","
            )}`
          : `Write an exciting 3-sentence post for a ${landlordRoomType} in ${selectedCity}. Rent: €${landlordRent}. Beds: ${landlordBeds}. Amenities: ${landlordAmenitiesList.join(
              ","
            )}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${effectiveKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!response.ok) throw new Error("API Key invalid or rate limited");

      const resultData = await response.json();
      const text = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        if (type === "tenant") setTenantDesc(text.trim());
        else setLandlordDesc(text.trim());
        showToast("✨ AI generated your description!");
      }
    } catch (error) {
      showToast("AI Error: Check your API key in the code!");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="h-screen bg-[#F0F2F5] font-sans text-[#1C1E21] flex flex-col overflow-hidden">
      {/* --- MULTI-IMAGE FULLSCREEN LIGHTBOX --- */}
      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox({ isOpen: false, media: [], index: 0 })}
        >
          <button className="absolute top-6 right-6 text-white p-2 bg-black/40 hover:bg-black/70 rounded-full transition-colors z-50">
            <X size={24} />
          </button>

          {lightbox.media.length > 1 && (
            <button
              className="absolute left-4 md:left-10 text-white p-3 bg-black/40 hover:bg-white/20 rounded-full transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => ({
                  ...prev,
                  index:
                    (prev.index - 1 + prev.media.length) % prev.media.length,
                }));
              }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <img
            src={lightbox.media[lightbox.index]}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl transition-transform"
            alt="Fullscreen Zoom"
            onClick={(e) => e.stopPropagation()}
          />

          {lightbox.media.length > 1 && (
            <button
              className="absolute right-4 md:right-10 text-white p-3 bg-black/40 hover:bg-white/20 rounded-full transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => ({
                  ...prev,
                  index: (prev.index + 1) % prev.media.length,
                }));
              }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          {lightbox.media.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-5 py-2 rounded-full text-sm font-bold tracking-widest z-50">
              {lightbox.index + 1} / {lightbox.media.length}
            </div>
          )}
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[300] animate-in fade-in slide-in-from-bottom-5 font-bold text-sm">
          {toastMessage}
        </div>
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="font-black text-xl">Edit Profile</h2>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={userData.avatar}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    alt="Me"
                  />
                  <label className="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full shadow border border-gray-200 hover:bg-gray-200 cursor-pointer">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  About Me
                </label>
                <textarea
                  value={userData.bio}
                  onChange={(e) =>
                    setUserData({ ...userData, bio: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all resize-none"
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-4">
                {/* Identity Verification */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-[#E11D48]">
                      <IdCard size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        Identity Verification
                      </h4>
                      <p className="text-xs text-gray-500">
                        {userData.isIDVerified
                          ? "Verified with ID Check"
                          : "Not yet verified"}
                      </p>
                    </div>
                  </div>
                  {!userData.isIDVerified && (
                    <button
                      onClick={() => {
                        setUserData({ ...userData, isIDVerified: true });
                        showToast("Identity Verified!");
                      }}
                      className="bg-[#E11D48] text-white text-xs font-black px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Verify Now
                    </button>
                  )}
                  {userData.isIDVerified && (
                    <CheckCircle
                      size={20}
                      className="text-blue-500"
                      fill="currentColor"
                      stroke="white"
                    />
                  )}
                </div>

                {/* Ownership Verification Toggle */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      Ownership Verification
                    </h4>
                    <p className="text-xs text-gray-500">
                      Verify that you own properties
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userData.verifiedOwnership || false}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          verifiedOwnership: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsEditingProfile(false);
                  if (currentProfileView?.isOwn)
                    setCurrentProfileView({
                      ...currentProfileView,
                      ...userData,
                    });
                  if (currentUser) {
                    try {
                      await updateProfile(currentUser, {
                        displayName: userData.name,
                      });
                    } catch (e) {}
                  }
                  showToast("Profile Updated!");
                }}
                className="flex-1 py-3 bg-[#E11D48] text-white font-black rounded-xl hover:bg-red-700 shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHAT BOX --- */}
      {activeChat && (
        <div
          className={`fixed bottom-0 right-4 md:right-10 w-[330px] bg-white shadow-2xl rounded-t-xl z-[150] border border-gray-200 transition-all duration-300 transform ${
            activeChat.status === "minimized"
              ? "translate-y-[calc(100%-45px)]"
              : "translate-y-0"
          }`}
        >
          <div
            className="bg-white border-b border-gray-200 p-3 flex items-center justify-between rounded-t-xl cursor-pointer hover:bg-gray-50"
            onClick={() =>
              setActiveChat({
                ...activeChat,
                status: activeChat.status === "open" ? "minimized" : "open",
              })
            }
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={activeChat.avatar}
                  className="w-8 h-8 rounded-full object-cover"
                  alt="Chat"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <h4 className="text-sm font-bold text-gray-800">
                {activeChat.name}
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveChat({
                    ...activeChat,
                    status: activeChat.status === "open" ? "minimized" : "open",
                  });
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"
              >
                {activeChat.status === "open" ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveChat(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar flex flex-col">
            {currentChatMessages.length === 0 && (
              <p className="text-center text-xs text-gray-400 mt-4">
                Start of conversation
              </p>
            )}
            {currentChatMessages.map((msg) => {
              const isMe = msg.sender === currentUser?.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-[14px] ${
                      isMe
                        ? "bg-[#E11D48] text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-full px-3 py-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Aa"
                className="bg-transparent border-none outline-none text-sm flex-1"
              />
              <button
                onClick={sendMessage}
                className={`${
                  currentInput.trim() ? "text-[#E11D48]" : "text-gray-400"
                }`}
              >
                <Send size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-14 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={24} />
            </button>
            <div
              className="h-10 flex items-center cursor-pointer"
              onClick={resetToHome}
            >
              <StayUpLogo />
            </div>
          </div>

          <nav className="hidden lg:flex items-center h-full">
            <HeaderNavIcon
              icon={<Home size={28} />}
              active={activeTab === "home" && !currentProfileView}
              onClick={resetToHome}
            />
            <HeaderNavIcon
              icon={<Globe size={28} />}
              active={activeTab === "map"}
              onClick={() => {
                setActiveTab("map");
                showToast("Map coming soon!");
              }}
            />
            <HeaderNavIcon
              icon={<PlusSquare size={28} />}
              active={activeTab === "post"}
              onClick={() => {
                if (isLoggedIn) {
                  setPostType("landlord");
                  setEditingPostId(null);
                  setCurrentProfileView(null);
                } else showToast("Login to post");
              }}
            />
          </nav>

          <div className="flex items-center gap-3 relative">
            <div
              onClick={() => setIsInboxOpen(!isInboxOpen)}
              className={`p-2.5 rounded-full cursor-pointer transition-colors relative ${
                isInboxOpen
                  ? "bg-red-50 text-[#E11D48]"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <MessageCircle size={20} />
              {/* Dynamic Notification Badge for Unread Messages */}
              {totalUnreadMessages > 0 && (
                <div className="absolute top-0 right-0 transform translate-x-[20%] -translate-y-[20%] bg-red-600 text-white text-[10px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                </div>
              )}
            </div>

            {isInboxOpen && (
              <div className="absolute top-12 right-0 w-80 bg-white shadow-2xl rounded-xl border border-gray-200 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="font-black text-xl">Chats</h3>
                  <button
                    onClick={() => setIsInboxOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {derivedRecentChats.length === 0 && (
                    <p className="text-center text-sm font-bold text-gray-400 py-6">
                      No messages yet
                    </p>
                  )}
                  {derivedRecentChats.map((chat) => (
                    <div
                      key={chat.uid}
                      onClick={() => handleStartChat(chat)}
                      className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        chat.unread ? "bg-red-50/50" : ""
                      }`}
                    >
                      <img
                        src={chat.img}
                        className="w-12 h-12 rounded-full object-cover"
                        alt="Chat"
                      />
                      <div className="flex-1 overflow-hidden">
                        <h4
                          className={`text-[15px] ${
                            chat.unread
                              ? "font-black text-gray-900"
                              : "font-bold text-gray-800"
                          }`}
                        >
                          {chat.author}
                        </h4>
                        <p
                          className={`text-xs truncate ${
                            chat.unread
                              ? "text-gray-800 font-bold"
                              : "text-gray-500"
                          }`}
                        >
                          {chat.lastMsg}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] ${
                            chat.unread
                              ? "text-[#E11D48] font-black"
                              : "text-gray-400 font-bold"
                          }`}
                        >
                          {chat.time}
                        </span>
                        {chat.unread && (
                          <div className="w-2.5 h-2.5 bg-[#E11D48] rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div
              onClick={() => showToast("Notifications")}
              className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer relative"
            >
              <Bell size={20} />
            </div>

            {/* User Avatar & Logout Icon Container */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-3 ml-1">
                <img
                  src={userData.avatar}
                  className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                  alt="My Avatar"
                  onClick={() => openProfile({}, true)}
                />
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-[#E11D48] hover:bg-red-50 p-2 rounded-full transition-all"
                  title="Log out"
                >
                  <LogOut size={20} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  showToast("Logged in");
                }}
                className="bg-[#E11D48] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- LOGIN / REGISTRATION OVERLAY --- */}
      {!isLoggedIn && (
        <div className="flex-1 flex items-center justify-center p-4 absolute inset-0 z-[200] bg-[#F0F2F5] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300 my-auto">
            {/* Left Side: Login */}
            <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
              <div className="flex justify-center mb-6">
                <StayUpLogo />
              </div>
              <h2 className="text-2xl font-black mb-8 text-gray-800 tracking-tight text-center">
                Welcome back
              </h2>

              <div className="space-y-4">
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                  />
                </div>

                <button
                  onClick={handleLoginAction}
                  className="w-full bg-[#E11D48] text-white font-black py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl mt-4 active:scale-95"
                >
                  Log In
                </button>
              </div>
            </div>

            {/* Right Side: Registration */}
            <div className="flex-1 p-8 md:p-12 bg-gray-50 flex flex-col justify-center">
              <h2 className="text-2xl font-black mb-8 text-gray-800 tracking-tight text-center">
                Create an Account
              </h2>

              <div className="space-y-4">
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full mt-1 bg-white border border-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full mt-1 bg-white border border-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full mt-1 bg-white border border-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                  />
                </div>
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 bg-white border border-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#E11D48] transition-all"
                  />
                </div>

                <button
                  onClick={handleRegisterAction}
                  className="w-full bg-gray-800 text-white font-black py-4 rounded-xl hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl mt-4 active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN LAYOUT --- */}
      {isLoggedIn && (
        <div className="flex flex-1 overflow-hidden pt-2">
          {/* MOBILE OVERLAY SIDEBAR */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[160] lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
              ></div>
              <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-in slide-in-from-left duration-300 overflow-y-auto p-4">
                <SidebarContent
                  selectedCity={selectedCity}
                  expandedCountries={expandedCountries}
                  toggleCountry={toggleCountry}
                  handleCitySelect={handleCitySelect}
                  resetToHome={resetToHome}
                  currentProfile={currentProfileView}
                  openOwnProfile={() => openProfile({}, true)}
                  userData={userData}
                />
              </aside>
            </div>
          )}

          <aside className="w-64 xl:w-80 flex-shrink-0 overflow-y-auto custom-scrollbar px-4 hidden lg:block">
            <SidebarContent
              selectedCity={selectedCity}
              expandedCountries={expandedCountries}
              toggleCountry={toggleCountry}
              handleCitySelect={handleCitySelect}
              resetToHome={resetToHome}
              currentProfile={currentProfileView}
              openOwnProfile={() => openProfile({}, true)}
              userData={userData}
            />
          </aside>

          <main className="flex-1 overflow-y-auto custom-scrollbar px-2 sm:px-4 pb-20">
            <div className="max-w-[680px] mx-auto">
              {currentProfileView ? (
                <UserProfileView
                  profile={currentProfileView}
                  posts={posts.filter((p) => p.authorUid === currentUser?.uid)}
                  favoritePosts={posts.filter((p) => favorites.includes(p.id))}
                  currentUser={currentUser}
                  onBack={() => setCurrentProfileView(null)}
                  onMessageClick={handleStartChat}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onProfileClick={openProfile}
                  onEdit={() => setIsEditingProfile(true)}
                  onStatusChange={changePostStatus}
                  onEditPost={handleEditPost}
                  onDelete={deletePost}
                  isLoggedIn={isLoggedIn}
                  onImageClick={(media, startIndex) =>
                    setLightbox({ isOpen: true, media, index: startIndex })
                  }
                />
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex gap-3 items-center">
                      <img
                        src={userData.avatar}
                        className="w-10 h-10 rounded-full object-cover"
                        alt="Me"
                      />
                      <button
                        onClick={() => {
                          setPostType("tenant");
                          setEditingPostId(null);
                        }}
                        className="flex-1 bg-[#F0F2F5] hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full text-sm sm:text-[16px]"
                      >
                        Post your rental needs in {selectedCity}...
                      </button>
                    </div>
                    <div className="flex border-t border-gray-100 mt-3 pt-3 gap-2">
                      <button
                        onClick={() => {
                          setPostType("tenant");
                          setEditingPostId(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 font-bold text-sm text-gray-600 transition-colors"
                      >
                        <User size={20} className="text-blue-500" /> Post as
                        Tenant
                      </button>
                      <button
                        onClick={() => {
                          setPostType("landlord");
                          setEditingPostId(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 font-bold text-sm text-gray-600 transition-colors"
                      >
                        <ImageIcon size={20} className="text-green-500" /> Post
                        as Landlord
                      </button>
                    </div>
                  </div>

                  {/* --- ADVANCED POST FORM --- */}
                  {postType && (
                    <div className="bg-white rounded-xl shadow-md border-2 border-red-100 p-6 mb-4 animate-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[80vh] custom-scrollbar">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-gray-800">
                          {editingPostId
                            ? postType === "tenant"
                              ? "Update & Renew Search"
                              : "Update & Renew Property"
                            : postType === "tenant"
                            ? "Describe your search"
                            : "List your available property"}
                        </h3>
                        <button
                          onClick={() => {
                            setPostType(null);
                            setEditingPostId(null);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="space-y-5">
                        {/* AI Magic Button */}
                        <button
                          onClick={() => generateAIDescription(postType)}
                          disabled={isGeneratingAI}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg text-xs font-black text-[#E11D48] hover:shadow-sm transition-all disabled:opacity-50"
                        >
                          {isGeneratingAI ? (
                            <div className="w-3 h-3 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles size={14} />
                          )}
                          {isGeneratingAI
                            ? "AI IS WRITING..."
                            : "GENERATE AI DESCRIPTION"}
                        </button>

                        <textarea
                          value={
                            postType === "tenant" ? tenantDesc : landlordDesc
                          }
                          onChange={(e) =>
                            postType === "tenant"
                              ? setTenantDesc(e.target.value)
                              : setLandlordDesc(e.target.value)
                          }
                          placeholder={
                            postType === "tenant"
                              ? "Tell people about yourself, habits, and budget..."
                              : "Describe the apartment features, rules, and roommates..."
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 focus:ring-2 focus:ring-[#E11D48] outline-none transition-all"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase">
                              Monthly{" "}
                              {postType === "tenant" ? "Budget" : "Rent"} (€)
                            </label>
                            <input
                              type="number"
                              value={
                                postType === "tenant"
                                  ? tenantBudget
                                  : landlordRent
                              }
                              onChange={(e) =>
                                postType === "tenant"
                                  ? setTenantBudget(e.target.value)
                                  : setLandlordRent(e.target.value)
                              }
                              placeholder="e.g. 650"
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#E11D48]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase">
                              Room Type
                            </label>
                            <select
                              value={
                                postType === "tenant"
                                  ? tenantRoomType
                                  : landlordRoomType
                              }
                              onChange={(e) =>
                                postType === "tenant"
                                  ? setTenantRoomType(e.target.value)
                                  : setLandlordRoomType(e.target.value)
                              }
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-sm"
                            >
                              <option>Shared Room</option>
                              <option>Private Room</option>
                              <option>Entire Flat</option>
                              {postType === "landlord" && (
                                <option>Studio</option>
                              )}
                            </select>
                          </div>
                        </div>

                        {postType === "landlord" && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">
                                  Bedrooms
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="e.g. 2"
                                  value={landlordBeds}
                                  onChange={(e) =>
                                    setLandlordBeds(e.target.value)
                                  }
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#E11D48]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">
                                  Bathrooms
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="e.g. 1"
                                  value={landlordBaths}
                                  onChange={(e) =>
                                    setLandlordBaths(e.target.value)
                                  }
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#E11D48]"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">
                                  Monthly Bills (€)
                                </label>
                                <input
                                  type="number"
                                  disabled={billsFlexible}
                                  placeholder="50"
                                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none ${
                                    billsFlexible ? "opacity-30" : ""
                                  }`}
                                />
                                <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={billsFlexible}
                                    onChange={(e) =>
                                      setBillsFlexible(e.target.checked)
                                    }
                                    className="rounded accent-[#E11D48]"
                                  />
                                  <span className="text-[10px] font-bold text-gray-400">
                                    Bills Flexible
                                  </span>
                                </label>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">
                                  Security Deposit (€)
                                </label>
                                <input
                                  type="number"
                                  disabled={depositDiscussLater}
                                  placeholder="1000"
                                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none ${
                                    depositDiscussLater ? "opacity-30" : ""
                                  }`}
                                />
                                <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={depositDiscussLater}
                                    onChange={(e) =>
                                      setDepositDiscussLater(e.target.checked)
                                    }
                                    className="rounded accent-[#E11D48]"
                                  />
                                  <span className="text-[10px] font-bold text-gray-400">
                                    Discuss Privately
                                  </span>
                                </label>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Amenity / Preference Checkboxes */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase">
                            {postType === "tenant"
                              ? "Preferences"
                              : "Amenities"}
                          </label>
                          <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            {(postType === "tenant"
                              ? [
                                  "Female Only",
                                  "Male Only",
                                  "Couple Friendly",
                                  "Pet Friendly",
                                  "Non-Smoker",
                                ]
                              : [
                                  "Wi-Fi",
                                  "AC",
                                  "Heating",
                                  "Balcony",
                                  "Lift",
                                  "Furnished",
                                ]
                            ).map((item) => {
                              const isChecked =
                                postType === "tenant"
                                  ? tenantPrefs.includes(item)
                                  : landlordAmenitiesList.includes(item);
                              const toggleItem = () => {
                                if (postType === "tenant") {
                                  setTenantPrefs((prev) =>
                                    prev.includes(item)
                                      ? prev.filter((p) => p !== item)
                                      : [...prev, item]
                                  );
                                } else {
                                  setLandlordAmenitiesList((prev) =>
                                    prev.includes(item)
                                      ? prev.filter((p) => p !== item)
                                      : [...prev, item]
                                  );
                                }
                              };
                              return (
                                <label
                                  key={item}
                                  className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={toggleItem}
                                    className="rounded accent-[#E11D48] w-4 h-4"
                                  />
                                  {item}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Calendar Section */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                          {postType === "tenant" && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isLongTerm}
                                onChange={(e) =>
                                  setIsLongTerm(e.target.checked)
                                }
                                className="rounded accent-[#E11D48]"
                              />
                              <span className="text-xs font-black text-gray-700 uppercase">
                                Long-term stay (No move-out)
                              </span>
                            </label>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-500 uppercase">
                                {postType === "tenant"
                                  ? "Move-in"
                                  : "Available From"}
                              </label>
                              <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label
                                className={`text-[10px] font-black uppercase ${
                                  isLongTerm ? "text-gray-300" : "text-gray-500"
                                }`}
                              >
                                {postType === "tenant"
                                  ? "Move-out"
                                  : "Available To"}
                              </label>
                              <input
                                type="date"
                                disabled={isLongTerm}
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className={`w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none ${
                                  isLongTerm ? "opacity-30" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Photo/Video Upload (Landlord Only) */}
                        {postType === "landlord" && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase">
                              Photos & Videos (Min 1)
                            </label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col items-center">
                              <input
                                type="file"
                                multiple
                                id="media-up"
                                className="hidden"
                                onChange={handleFileChange}
                              />
                              <label
                                htmlFor="media-up"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <div className="p-3 bg-gray-200 rounded-full text-gray-500">
                                  {isUploading ? (
                                    <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <ImagePlus size={24} />
                                  )}
                                </div>
                                <span className="text-sm font-black text-gray-700">
                                  {isUploading
                                    ? "Uploading..."
                                    : "Add Media Files"}
                                </span>
                              </label>
                            </div>
                            {landlordMedia.length > 0 && (
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                {landlordMedia.map((m) => (
                                  <div
                                    key={m.id}
                                    className="relative bg-white border border-gray-100 rounded-lg overflow-hidden group"
                                  >
                                    <button
                                      onClick={() => removeMedia(m.id)}
                                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full z-10 opacity-0 group-hover:opacity-100"
                                    >
                                      <X size={12} />
                                    </button>
                                    <img
                                      src={m.url}
                                      className="w-full h-24 object-cover"
                                      alt="Upload"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Caption..."
                                      value={m.caption}
                                      onChange={(e) =>
                                        updateCaption(m.id, e.target.value)
                                      }
                                      className="w-full p-1.5 text-[10px] border-t border-gray-100 outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* POST BUTTON */}
                        <button
                          onClick={handlePostSubmit}
                          disabled={
                            (postType === "landlord" &&
                              landlordMedia.length < 1) ||
                            isUploading
                          }
                          className={`w-full font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 ${
                            (postType === "landlord" &&
                              landlordMedia.length < 1) ||
                            isUploading
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-[#E11D48] text-white hover:bg-red-700"
                          }`}
                        >
                          {postType === "landlord" && landlordMedia.length < 1
                            ? `ADD A PHOTO TO POST`
                            : editingPostId
                            ? "UPDATE & RENEW LISTING"
                            : `POST TO ${selectedCity.toUpperCase()} TIMELINE`}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h2 className="text-gray-500 font-bold text-sm px-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isDbConnected
                              ? "bg-green-500 animate-pulse"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        Showing Live Listings in {selectedCity}
                      </div>
                    </h2>

                    {posts
                      .filter((p) => p.city === selectedCity)
                      .map((post) => (
                        <RentalPost
                          key={post.id}
                          {...post}
                          isOwnPost={
                            currentUser && post.authorUid === currentUser.uid
                          }
                          onProfileClick={openProfile}
                          onMessageClick={handleStartChat}
                          isFavorited={favorites.includes(post.id)}
                          onToggleFavorite={() => toggleFavorite(post)}
                          onStatusChange={changePostStatus}
                          onEditPost={handleEditPost}
                          onDelete={deletePost}
                          onImageClick={(media, startIndex) =>
                            setLightbox({
                              isOpen: true,
                              media,
                              index: startIndex,
                            })
                          }
                        />
                      ))}
                    {posts.filter((p) => p.city === selectedCity).length ===
                      0 && (
                      <div className="text-center text-gray-500 py-10">
                        <p className="font-bold">
                          No listings in {selectedCity} yet. Be the first!
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>

          <aside className="w-72 xl:w-80 flex-shrink-0 overflow-y-auto custom-scrollbar px-4 hidden xl:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h4 className="font-bold text-gray-500 text-sm mb-4">
                Community Tips
              </h4>
              <TipItem text="Always check profiles before sending money." />
              <TipItem text="Video call to see the room live." />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  selectedCity,
  expandedCountries,
  toggleCountry,
  handleCitySelect,
  resetToHome,
  currentProfile,
  openOwnProfile,
  userData,
}) {
  return (
    <div className="space-y-1">
      <SidebarItem
        icon={
          <img
            src={userData.avatar}
            className="w-7 h-7 rounded-full object-cover"
            alt="Me"
          />
        }
        label={userData.name}
        onClick={openOwnProfile}
        active={currentProfile?.isOwn}
      />
      <SidebarItem
        icon={<Briefcase size={22} className="text-[#E11D48]" />}
        label="Rental Marketplace"
        active={!currentProfile}
        onClick={resetToHome}
      />
      <div className="h-[1px] bg-gray-200 my-4"></div>
      <h3 className="px-2 text-gray-500 font-bold text-xs mb-3 uppercase tracking-widest">
        Regions & Cities
      </h3>
      {EUROPEAN_REGIONS.map((region) => (
        <div key={region.name} className="mb-1">
          <button
            onClick={() => toggleCountry(region.name)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            <span className="font-bold text-[15px]">
              {getFlag(region.name)} {region.name}
            </span>
            {expandedCountries.includes(region.name) ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {expandedCountries.includes(region.name) && (
            <div className="ml-6 space-y-1 mt-1">
              {region.cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left p-1.5 rounded-md text-sm ${
                    selectedCity === city && !currentProfile
                      ? "bg-red-50 text-[#E11D48] font-black"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UserProfileView({
  profile,
  posts,
  favoritePosts,
  currentUser,
  onBack,
  onMessageClick,
  favorites,
  toggleFavorite,
  onProfileClick,
  onEdit,
  onStatusChange,
  onEditPost,
  onDelete,
  isLoggedIn,
  onImageClick,
}) {
  const [activeTab, setActiveTab] = useState("posts");
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold">{profile.name}</h2>
      </div>
      <div className="p-6 md:p-8 md:flex gap-6 items-center">
        <img
          src={profile.avatar}
          className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow object-cover"
          alt="Profile"
        />
        <div className="flex-1 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black">{profile.name}</h1>
            {profile.isIDVerified && (
              <CheckCircle
                size={24}
                className="text-blue-500 fill-current"
                stroke="white"
              />
            )}
          </div>
          <p className="text-gray-500 font-bold uppercase text-xs">
            {profile.type} • Joined {profile.joined}
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "{profile.bio || profile.about}"
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            {!profile.isOwn && (
              <button
                onClick={() =>
                  onMessageClick({
                    uid: profile.uid || profile.authorUid,
                    name: profile.name,
                    avatar: profile.avatar,
                  })
                }
                className="bg-[#E11D48] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-red-700 transition-colors"
              >
                <MessageCircle size={18} /> Message
              </button>
            )}
            {profile.isOwn && (
              <button
                onClick={onEdit}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200"
              >
                <Settings size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-t border-gray-200 px-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-4 font-bold text-sm border-b-4 ${
            activeTab === "posts"
              ? "border-[#E11D48] text-[#E11D48]"
              : "border-transparent text-gray-500"
          }`}
        >
          Timeline
        </button>
        {profile.isOwn && (
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-4 font-bold text-sm border-b-4 ${
              activeTab === "favorites"
                ? "border-[#E11D48] text-[#E11D48]"
                : "border-transparent text-gray-500"
            }`}
          >
            Favorites ({favorites.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 py-4 font-bold text-sm border-b-4 ${
            activeTab === "reviews"
              ? "border-[#E11D48] text-[#E11D48]"
              : "border-transparent text-gray-500"
          }`}
        >
          Reviews
        </button>
      </div>
      <div className="p-4 bg-gray-50 min-h-[300px]">
        {activeTab === "posts" && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <RentalPost
                  key={post.id}
                  {...post}
                  isOwnPost={
                    isLoggedIn &&
                    currentUser &&
                    post.authorUid === currentUser.uid
                  }
                  onProfileClick={onProfileClick}
                  onMessageClick={onMessageClick}
                  isFavorited={favorites.includes(post.id)}
                  onToggleFavorite={() => toggleFavorite(post)}
                  onStatusChange={onStatusChange}
                  onEditPost={onEditPost}
                  onDelete={onDelete}
                  onImageClick={(media, startIndex) =>
                    onImageClick(media, startIndex)
                  }
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10 font-bold">
                No posts yet.
              </p>
            )}
          </div>
        )}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            {favoritePosts && favoritePosts.length > 0 ? (
              favoritePosts.map((post) => (
                <RentalPost
                  key={post.id}
                  {...post}
                  isOwnPost={
                    isLoggedIn &&
                    currentUser &&
                    post.authorUid === currentUser.uid
                  }
                  onProfileClick={onProfileClick}
                  onMessageClick={onMessageClick}
                  isFavorited={true}
                  onToggleFavorite={() => toggleFavorite(post)}
                  onStatusChange={onStatusChange}
                  onEditPost={onEditPost}
                  onDelete={onDelete}
                  onImageClick={(media, startIndex) =>
                    onImageClick(media, startIndex)
                  }
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10 font-bold">
                No favorites yet.
              </p>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <p className="text-center text-gray-500 py-10 font-bold">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}

function RentalPost({
  id,
  author,
  authorUid,
  time,
  city,
  type,
  content,
  price,
  budget,
  img,
  status,
  roomType,
  beds,
  baths,
  dateFrom,
  dateTo,
  isLongTerm,
  features,
  media,
  billsFlexible,
  isOwnPost,
  onProfileClick,
  onMessageClick,
  isFavorited,
  onToggleFavorite,
  onStatusChange,
  onEditPost,
  onDelete,
  onImageClick,
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden transition-opacity ${
        status && status !== "available" ? "opacity-70" : ""
      }`}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() =>
            onProfileClick({ author, img, type, city, uid: authorUid })
          }
        >
          <img
            src={img}
            className="w-10 h-10 rounded-full object-cover"
            alt="Post Author"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[15px]">{author}</h4>
              {status === "reserved" && (
                <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Reserved
                </span>
              )}
              {status === "rented" && (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Rented
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {getTimeAgo(time)} • {city}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Main Content & Image Layout */}
        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <p className="text-[15px] whitespace-pre-wrap">{content}</p>

            {/* Dynamic Meta Details */}
            <div className="mt-3 space-y-1.5">
              {roomType && (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <Home size={14} className="text-gray-400" /> {roomType}
                  {type === "landlord" && (beds || baths)
                    ? ` • ${beds || 0} Bed • ${baths || 0} Bath`
                    : ""}
                </div>
              )}
              {(dateFrom || isLongTerm) && (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  {dateFrom ? `From ${formatDate(dateFrom)}` : "Flexible Start"}
                  {isLongTerm
                    ? " (Long-term)"
                    : dateTo
                    ? ` - ${formatDate(dateTo)}`
                    : ""}
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Picture Thumbnail beside text */}
          {media && media.length > 0 && (
            <div
              className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100 cursor-pointer group"
              onClick={() => onImageClick && onImageClick(media, 0)}
            >
              <img
                src={media[0]}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                alt="Listing Media"
              />
              {media.length > 1 && (
                <div className="absolute bottom-1.5 right-1.5 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm pointer-events-none">
                  +{media.length - 1}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Tags */}
        {features && features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {features.map((f) => (
              <span
                key={f}
                className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Pricing / Budget Footer */}
        <div className="flex gap-2 mb-1">
          <span className="bg-red-50 text-[#E11D48] text-xs font-black px-3 py-1 rounded-full border border-red-100 uppercase tracking-tighter">
            {type === "tenant" ? `Budget: €${budget}` : `Price: €${price}`}
          </span>
          {type === "landlord" && billsFlexible && (
            <span className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
              Bills Flexible
            </span>
          )}
        </div>

        {/* Marketplace Buttons */}
        {isOwnPost ? (
          <div className="flex border-t border-gray-100 mt-4 pt-2 gap-2">
            {type === "landlord" ? (
              <>
                {status === "available" && (
                  <button
                    onClick={() => onStatusChange(id, "reserved")}
                    className="flex-1 py-2 font-bold text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    Mark Reserved
                  </button>
                )}
                {status === "reserved" && (
                  <button
                    onClick={() => onStatusChange(id, "rented")}
                    className="flex-1 py-2 font-bold text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Mark Rented
                  </button>
                )}
                {(status === "reserved" || status === "rented") && (
                  <button
                    onClick={() => onEditPost(id)}
                    className="flex-1 py-2 font-bold text-sm bg-[#E11D48] text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Edit & Renew
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onDelete(id)}
                className="flex-1 py-2 font-bold text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Remove Post
              </button>
            )}
          </div>
        ) : (
          <div className="flex border-t border-gray-100 mt-4 pt-2 gap-1">
            <button
              onClick={onToggleFavorite}
              className={`flex-1 py-2 font-black text-sm flex items-center justify-center gap-2 rounded-lg hover:bg-gray-50 transition-colors ${
                isFavorited ? "text-[#E11D48]" : "text-gray-600"
              }`}
            >
              <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />{" "}
              {isFavorited ? "Favorited" : "Favorite"}
            </button>
            <button
              onClick={() =>
                onMessageClick({ uid: authorUid, name: author, avatar: img })
              }
              className="flex-1 py-2 bg-[#E11D48] text-white font-black text-sm flex items-center justify-center gap-2 rounded-lg shadow-sm hover:bg-red-700 transition-colors"
            >
              <MessageCircle size={18} /> Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderNavIcon({ icon, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-10 h-full flex items-center justify-center cursor-pointer border-b-4 transition-colors ${
        active
          ? "border-[#E11D48] text-[#E11D48]"
          : "border-transparent text-gray-500 hover:bg-gray-100"
      }`}
    >
      {icon}
    </div>
  );
}
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-lg font-bold text-[14px] transition-all ${
        active
          ? "bg-white shadow-sm text-[#E11D48]"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      <span className="w-8 flex justify-center">{icon}</span> {label}
    </button>
  );
}
function TipItem({ text }) {
  return (
    <div className="flex gap-2 items-start text-[13px] text-gray-600 mb-2 font-medium">
      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
      <p>{text}</p>
    </div>
  );
}
function getFlag(country) {
  const flags = {
    Spain: "🇪🇸",
    Germany: "🇩🇪",
    Netherlands: "🇳🇱",
    Sweden: "🇸🇪",
    Portugal: "🇵🇹",
    France: "🇫🇷",
    Poland: "🇵🇱",
    Italy: "🇮🇹",
    Belgium: "🇧🇪",
    Austria: "🇦🇹",
  };
  return flags[country] || "📍";
}

function getTimeAgo(timestamp) {
  if (!timestamp) return "Just now";
  if (typeof timestamp === "string") return timestamp;
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
