import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Wallet, Send, CreditCard, LogIn, LogOut, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock API functions (replace with actual API calls)
const api = {
    register: async (userData: any) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate successful registration
        if (userData.email && userData.password && userData.name) {
            return { success: true, message: 'Registration successful!', user: { ...userData, id: crypto.randomUUID(), walletId: crypto.randomUUID() } };
        }
        return { success: false, message: 'Registration failed. Please check your details.' };
    },
    login: async (credentials: any) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
            return { success: true, message: 'Login successful!', user: { id: 'user123', name: 'Test User', email: 'test@example.com', walletId: 'wallet456' } };
        }
        return { success: false, message: 'Invalid credentials.' };
    },
    createWallet: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'Wallet created!', wallet: { id: crypto.randomUUID(), userId, balance: 0 } };
    },
    getUserWallet: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (userId) {
            return { success: true, wallet: { id: 'wallet456', userId: 'user123', balance: 1000 } }; // Mock data
        }
        return { success: false, message: "Wallet not found" };
    },
    transferFunds: async (senderWalletId: string, receiverWalletId: string, amount: number) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (amount > 0) {
            return { success: true, message: 'Transfer successful!', transaction: { senderWalletId, receiverWalletId, amount, timestamp: new Date() } };
        }
        return { success: false, message: 'Invalid transfer amount.' };
    },
    createVirtualCard: async (walletId: string) => {
        await new Promise(resolve => setTimeout(resolve, 700));
        return {
            success: true, message: 'Virtual card created!', card: {
                id: crypto.randomUUID(),
                walletId,
                cardNumber: '**** **** **** 1234', // Mocked
                expiryDate: '12/28',             // Mocked
                cvv: '123'                     // Mocked
            }
        };
    },
    getUserVirtualCard: async (walletId: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (walletId) {
            return { success: true, card: { id: 'card123', walletId: 'wallet456', cardNumber: '**** **** **** 5678', expiryDate: '09/25', cvv: '456' } }; // Mocked
        }
        return { success: false, message: "Virtual card not found" };
    }
};

// Animation Variants
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const WalletApp = () => {
    const [user, setUser] = useState<any>(null); // Store logged-in user
    const [wallet, setWallet] = useState<any>(null);
    const [virtualCard, setVirtualCard] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('login'); // 'login', 'register', 'wallet'
    const [formData, setFormData] = useState({ // Unified form data
        name: '',
        email: '',
        password: '',
        confirmPassword: '', // Only for registration
        amount: 0,
        receiverEmail: ''
    });

    // --- Authentication ---
    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError(null);
        const result = await api.register({ name: formData.name, email: formData.email, password: formData.password });
        setLoading(false);
        if (result.success) {
            setUser(result.user);
            setActiveTab('wallet'); // Go to wallet tab after successful registration
            setFormData({ name: '', email: '', password: '', confirmPassword: '', amount: 0, receiverEmail: '' }); //clear form
        } else {
            setError(result.message);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const result = await api.login({ email: formData.email, password: formData.password });
        setLoading(false);
        if (result.success) {
            setUser(result.user);
            setActiveTab('wallet');
        } else {
            setError(result.message);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setWallet(null);
        setVirtualCard(null);
        setActiveTab('login');
        setFormData({ name: '', email: '', password: '', confirmPassword: '', amount: 0, receiverEmail: '' }); // Reset form
    };

    // --- Wallet & Card ---
    const fetchWallet = async () => {
        if (user) {
            setLoading(true);
            const result = await api.getUserWallet(user.id);
            setLoading(false);
            if (result.success) {
                setWallet(result.wallet);
            } else {
                setError(result.message);
            }
        }
    };

    const fetchVirtualCard = async () => {
        if (user) {
            setLoading(true);
            const result = await api.getUserVirtualCard(wallet?.id);
            setLoading(false);
            if (result.success) {
                setVirtualCard(result.card);
            } else {
                setError(result.message);
            }
        }
    };

    const handleCreateVirtualCard = async () => {
        if (!wallet) {
            setError("Please create a wallet first.");
            return;
        }
        setLoading(true);
        setError(null);
        const result = await api.createVirtualCard(wallet.id);
        setLoading(false);
        if (result.success) {
            setVirtualCard(result.card);
        } else {
            setError(result.message);
        }
    };

    const handleTransferFunds = async () => {
        if (!wallet) {
            setError("Please create a wallet to transfer funds.");
            return;
        }
        setLoading(true);
        setError(null);
        // In a real app, you'd fetch the receiver's wallet ID by email
        const receiverWalletId = 'receiverWalletId'; // Mocked.  Replace
        const result = await api.transferFunds(wallet.id, receiverWalletId, formData.amount);
        setLoading(false);
        if (result.success) {
            await fetchWallet(); // Refresh wallet balance
            setFormData({ ...formData, amount: 0 }); // Clear amount
            alert(result.message);
        } else {
            setError(result.message);
        }
    };

    // --- Effects ---
    useEffect(() => {
        if (user) {
            fetchWallet();
            fetchVirtualCard(); // Fetch card on user login/registration
        }
    }, [user]);

    // --- Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- UI ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Wallet App
                    </h1>
                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300">
                                <User className='inline-block mr-1 w-4 h-4'/>
                                {user.name}
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="text-gray-300 hover:text-white hover:bg-gray-700 border-gray-700"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
                        <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                        </TabsTrigger>
                        <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Register
                        </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode='wait'>
                        {/* Login Tab Content */}
                        {activeTab === 'login' && (
                            <motion.div
                                key="login"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <TabsContent value="login">
                                    <Card className="bg-gray-800 border-gray-700">
                                        <CardHeader>
                                            <CardTitle className="text-white">Login</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Enter your credentials to access your account.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-gray-300">Email</label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                    className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="password" className="text-gray-300">Password</label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleLogin}
                                                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                                                disabled={loading}
                                            >
                                                {loading ? 'Loading...' : 'Login'}
                                            </Button>
                                            {error && <p className="text-red-500 text-sm">{error}</p>}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </motion.div>
                        )}

                        {/* Register Tab Content */}
                        {activeTab === 'register' && (
                            <motion.div
                                key="register"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <TabsContent value="register">
                                    <Card className="bg-gray-800 border-gray-700">
                                        <CardHeader>
                                            <CardTitle className="text-white">Register</CardTitle>
                                            <CardDescription className="text-gray-400">
                                                Create an account to get started.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-gray-300">Name</label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your full name"
                                                    className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-gray-300">Email</label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                    className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="password" className="text-gray-300">Password</label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    placeholder="Confirm your password"
                                                    className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleRegister}
                                                className="w-full bg-green-500 text-white hover:bg-green-600"
                                                disabled={loading}
                                            >
                                                {loading ? 'Loading...' : 'Register'}
                                            </Button>
                                            {error && <p className="text-red-500 text-sm">{error}</p>}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </motion.div>
                        )}
                    </AnimatePresence>

                {/* Wallet Tab (Conditional Rendering) */}
                {user && (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5" />
                                Your Wallet
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Manage your wallet and transactions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <p className="text-gray-400">Loading wallet data...</p>
                            ) : wallet ? (
                                <>
                                    <div className="bg-gray-700 p-4 rounded-md border border-gray-600">
                                        <p className="text-gray-300">Wallet ID: <span className="text-white font-medium">{wallet.id}</span></p>
                                        <p className="text-gray-300">Balance: <span className={cn("text-white font-medium", wallet.balance > 0 ? "text-green-400" : "text-gray-400")}>${wallet.balance}</span></p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Send className="w-4 h-4" />
                                            Transfer Funds
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                type="email"
                                                name="receiverEmail"
                                                value={formData.receiverEmail}
                                                onChange={handleInputChange}
                                                placeholder="Recipient's Email"
                                                className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                            />
                                            <Input
                                                type="number"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder="Amount"
                                                className="bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleTransferFunds}
                                            className="w-full bg-blue-500 text-white hover:bg-blue-600"
                                            disabled={loading || formData.amount <= 0}
                                        >
                                            {loading ? 'Transferring...' : 'Transfer Funds'}
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Virtual Card
                                        </h3>
                                        {virtualCard ? (
                                            <Card className="bg-gray-700 border-gray-600">
                                                <CardHeader>
                                                    <CardTitle className="text-white">Virtual Card Details</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300">Card Number: <span className="text-white font-medium">{virtualCard.cardNumber}</span></p>
                                                    <p className="text-gray-300">Expiry Date: <span className="text-white font-medium">{virtualCard.expiryDate}</span></p>
                                                    <p className="text-gray-300">CVV: <span className="text-white font-medium">{virtualCard.cvv}</span></p>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Button
                                                onClick={handleCreateVirtualCard}
                                                className="w-full bg-purple-500 text-white hover:bg-purple-600"
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Create Virtual Card'}
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400">No wallet found.  A wallet is automatically created upon successful registration.</p>
                            )}
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default WalletApp;
