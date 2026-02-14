/**
 * Guest Cart Helper Functions
 * 
 * Manages shopping cart for non-authenticated users using localStorage.
 * Follows e-commerce best practices from Amazon, eBay, Shopify.
 */

export interface GuestCartItem {
    productId: string;
    quantity: number;
    addedAt: number; // timestamp
}

export interface GuestCart {
    items: GuestCartItem[];
    expiresAt: number; // 30 days from creation
}

const GUEST_CART_KEY = 'soukloop_guest_cart';
const CART_EXPIRY_DAYS = 30;

/**
 * Get guest cart from localStorage
 * Returns empty cart if none exists or if expired
 */
export function getGuestCart(): GuestCart {
    // Server-side or build-time check
    if (typeof window === 'undefined') {
        return { items: [], expiresAt: Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000 };
    }

    try {
        const stored = localStorage.getItem(GUEST_CART_KEY);

        if (!stored) {
            // Create new cart with 30-day expiry
            return {
                items: [],
                expiresAt: Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000
            };
        }

        const cart: GuestCart = JSON.parse(stored);

        // Check if cart has expired
        if (cart.expiresAt < Date.now()) {
            localStorage.removeItem(GUEST_CART_KEY);
            return {
                items: [],
                expiresAt: Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000
            };
        }

        return cart;
    } catch (error) {
        console.error('Error reading guest cart:', error);
        return {
            items: [],
            expiresAt: Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        };
    }
}

/**
 * Save guest cart to localStorage
 */
export function saveGuestCart(cart: GuestCart): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving guest cart:', error);
    }
}

/**
 * Add item to guest cart
 * If item already exists, increases quantity
 */
export function addToGuestCart(productId: string, quantity: number = 1): GuestCart {
    const cart = getGuestCart();
    const existingIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingIndex >= 0) {
        // Item already exists. In this application, we only allow one of each product.
        // So we do nothing and return.
        return cart;
    } else {
        // New item
        cart.items.push({
            productId,
            quantity,
            addedAt: Date.now()
        });
    }

    saveGuestCart(cart);
    return cart;
}

/**
 * Update quantity of item in guest cart
 */
export function updateGuestCartItem(productId: string, quantity: number): GuestCart {
    const cart = getGuestCart();
    const existingIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingIndex >= 0) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(existingIndex, 1);
        } else {
            cart.items[existingIndex].quantity = quantity;
        }
    }

    saveGuestCart(cart);
    return cart;
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(productId: string): GuestCart {
    const cart = getGuestCart();
    cart.items = cart.items.filter(item => item.productId !== productId);
    saveGuestCart(cart);
    return cart;
}

/**
 * Clear entire guest cart
 */
export function clearGuestCart(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
        console.error('Error clearing guest cart:', error);
    }
}

/**
 * Get total number of items in guest cart
 */
export function getGuestCartCount(): number {
    const cart = getGuestCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Check if product is in guest cart
 */
export function isInGuestCart(productId: string): boolean {
    const cart = getGuestCart();
    return cart.items.some(item => item.productId === productId);
}

/**
 * Get specific item from guest cart
 */
export function getGuestCartItem(productId: string): GuestCartItem | undefined {
    const cart = getGuestCart();
    return cart.items.find(item => item.productId === productId);
}

/**
 * Get cart expiry date
 */
export function getGuestCartExpiryDate(): Date | null {
    const cart = getGuestCart();
    return cart.expiresAt ? new Date(cart.expiresAt) : null;
}

/**
 * Check if cart is close to expiring (within 7 days)
 */
export function isGuestCartNearExpiry(): boolean {
    const cart = getGuestCart();
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return cart.expiresAt < sevenDaysFromNow;
}
