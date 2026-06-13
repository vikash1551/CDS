import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";

import { useAuth, useRunnerStore } from "@/lib/store";
import { Star, MessageCircle, Navigation, CheckCircle2, Circle, Loader2, MapPin, Key, Clock, Award, Shield } from "lucide-react";
import { socketService } from "@/lib/socket";

type LendTrackSearch = {
  requestId?: string;
  lender?: string;
  distance?: string;
  rating?: string;
};

export const Route = createFileRoute("/lend-track")({
  validateSearch: (search: Record<string, unknown>): LendTrackSearch => {
    return {
      requestId: search.requestId as string | undefined,
      lender: search.lender as string | undefined,
      distance: search.distance as string | undefined,
      rating: search.rating as string | undefined,
    };
  },
  component: LendTrack,
});

const TIMELINE_STEPS = [
  { id: 1, title: "Request Item", desc: "Request placed securely." },
  { id: 2, title: "AI Match", desc: "Finding the best peer nearby..." },
  { id: 3, title: "Lender Accepts", desc: "Lender confirmed the request." },
  { id: 4, title: "Live Tracking", desc: "Meet at the designated spot." },
  { id: 5, title: "OTP Handover", desc: "Share OTP to receive item." },
  { id: 6, title: "Return Reminder", desc: "Automated safe-return tracking." },
  { id: 7, title: "Ratings & Rewards", desc: "Earn campus rep points." }
];

function LendTrack() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lendActiveStep, setLendActiveStep, lendLenderInfo, setLendLenderInfo } = useRunnerStore();

  
  // Timeline State
  const activeStep = lendActiveStep;
  const setActiveStep = setLendActiveStep;
  const lenderInfo = lendLenderInfo;
  const setLenderInfo = setLendLenderInfo;



  const lenderName = search.lender || "Priya Sharma";
  const lenderDistance = search.distance || "~150m";
  const lenderRating = search.rating ? parseFloat(search.rating) : 4.9;

  // Connect to Socket.IO for real-time timeline updates
  useEffect(() => {
    const socket = socketService.connect();
    const reqId = search.requestId || `req_${Date.now()}`;

    // Emit start_lend_flow to let the server drive the timeline
    socket.emit('start_lend_flow', {
      request_id: reqId,
      item: 'Requested Item',
    });

    // Listen for server-driven step updates
    socket.on('lend_step', (data: any) => {
      if (data.step) {
        setActiveStep(data.step);
      }
      if (data.match) {
        setLenderInfo({
          name: data.match.lender || lenderName,
          distance: data.match.distance || lenderDistance,
          rating: data.match.rating || lenderRating,
        });
      }
      if (data.desc) {
        // Update the step description with backend info
        toast.info(data.desc);
      }
    });

    return () => {
      socket.off('lend_step');
    };
  }, [search.requestId]);

  // Fallback: if no socket events arrive within 3s, use setTimeout
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (activeStep === 1) {
        setActiveStep(2);
      }
    }, 3000);
    return () => clearTimeout(fallback);
  }, [activeStep]);



  const getStepIcon = (stepId: number) => {
    if (stepId < activeStep) return <CheckCircle2 className="h-5 w-5 text-primary" />;
    if (stepId === activeStep) {
      if (stepId === 2) return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      return <Circle className="h-5 w-5 fill-primary text-primary animate-pulse" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground/30" />;
  };

  return (
    <MobileShell>
      <TopBar title="Order Status" />
      


      {/* Timeline Section */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-6 text-sm font-bold tracking-tight text-foreground">Timeline</h2>
          <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:border-l-2 before:border-border md:before:ml-[1.35rem]">
            {TIMELINE_STEPS.map((step) => {
              const isPast = step.id < activeStep;
              const isCurrent = step.id === activeStep;
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
                    {getStepIcon(step.id)}
                  </div>
                  <div className="pt-2">
                    <p className={`text-sm font-bold ${isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
                    
                    {/* Render Match Card if matched */}
                    {isCurrent && step.id === 2 && lenderInfo && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg">👤</div>
                        <div>
                          <p className="text-xs font-bold">Matched with {lenderInfo.name}</p>
                          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Star className="h-3 w-3 fill-warning text-warning" /> {lenderInfo.rating} · {lenderInfo.distance} away
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>      {/* Advance Demo Button (for testing/hackathon purposes) */}
      <div className="p-4 bg-background border-t border-border mb-16 md:mb-0">
        <button 
          onClick={() => setActiveStep(prev => prev < 7 ? prev + 1 : 1)}
          className="w-full text-xs py-3 bg-secondary text-secondary-foreground rounded-xl font-bold transition active:scale-95"
        >
          [Demo] Simulate next step
        </button>
      </div>

    </MobileShell>
  );
}
