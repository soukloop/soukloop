import { useState, useEffect } from 'react';

export type AuthStep =
    | 'closed'
    | 'main'
    | 'login'
    | 'signup'
    | 'reset-password'
    | 'verification'
    | 'new-password';

export type VerificationMode = 'signup' | 'reset';

interface AuthFlowState {
    step: AuthStep;
    email?: string;
    tempPassword?: string;
    verificationMode: VerificationMode;
    verifiedCode?: string;
}

const STORAGE_KEY = 'soukloop_auth_flow';

export function useAuthFlow() {
    // Initialize state with defaults
    const [state, setState] = useState<AuthFlowState>({
        step: 'closed', // Default to closed, will hydrate on mount
        verificationMode: 'signup',
    });

    const [isHydrated, setIsHydrated] = useState(false);

    // Load from storage on mount
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // If stored step is 'closed', we honor it (don't open)
                // If stored step is active (e.g. 'verification'), we restore it
                setState(parsed);
            } else {
                // If nothing stored, default to 'closed' (or 'main' if you want it to pop up by default)
                // But typically we wait for user interaction or "open" prop passed to AuthPopup
                setState(prev => ({ ...prev, step: 'closed' }));
            }
        } catch (e) {
            console.error('Failed to parse auth state', e);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Sync to storage whenever state changes
    useEffect(() => {
        if (!isHydrated) return;

        if (state.step === 'closed') {
            sessionStorage.removeItem(STORAGE_KEY);
        } else {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, isHydrated]);


    // Actions
    const openAuth = () => setState(prev => ({ ...prev, step: 'main', email: undefined, tempPassword: undefined }));

    const openLogin = (email?: string) => setState(prev => ({ ...prev, step: 'login', email: email || prev.email }));

    const openSignup = () => setState(prev => ({ ...prev, step: 'signup' }));

    const openResetPassword = () => setState(prev => ({ ...prev, step: 'reset-password' }));

    const openVerification = (email: string, mode: VerificationMode, password?: string) => {
        setState(prev => ({
            ...prev,
            step: 'verification',
            email,
            verificationMode: mode,
            tempPassword: password // Store password only if passed (signup flow)
        }));
    };

    const openNewPassword = (code: string) => {
        setState(prev => ({
            ...prev,
            step: 'new-password',
            verifiedCode: code
        }));
    };

    const closeAll = () => {
        setState({
            step: 'closed',
            verificationMode: 'signup', // reset defaults
            email: undefined,
            tempPassword: undefined,
            verifiedCode: undefined
        });
        sessionStorage.removeItem(STORAGE_KEY);
    };

    // Explicitly set state (useful for back buttons)
    const setStep = (step: AuthStep) => setState(prev => ({ ...prev, step }));

    return {
        state,
        isHydrated,
        actions: {
            openAuth,
            openLogin,
            openSignup,
            openResetPassword,
            openVerification,
            openNewPassword,
            closeAll,
            setStep
        }
    };
}
