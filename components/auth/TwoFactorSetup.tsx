"use client";

/**
 * TwoFactorSetup Component (Auth Version)
 * 
 * This is a re-export of the P2P TwoFactorSetup component which contains
 * the real TOTP implementation with otplib.
 * 
 * The P2P version:
 * - Uses real TOTP generation with otplib
 * - Encrypts secrets with AES-256
 * - Stores encrypted secrets in database
 * - Verifies codes properly
 */

// Re-export the P2P version which has the real implementation
export { TwoFactorSetup } from "@/components/p2p/settings/TwoFactorSetup";

