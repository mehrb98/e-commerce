import { Throttle } from "@nestjs/throttler";

// Strict rate for auth, payments
export const StrictThrottle = () => 
    Throttle({
      default: { 
            ttl: 1000, 
            limit: 3 
        }
    });


// Moderate rate for general usage
export const ModerateThrottle = () => 
    Throttle({
        default: { 
            ttl: 1000, 
            limit: 5 
        }
    });


// Relaxed rate for public endpoints
export const RelaxedThrottle = () => 
    Throttle({
        default: { 
            ttl: 1000, 
            limit: 20 
        }
    });