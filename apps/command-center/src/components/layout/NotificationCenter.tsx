"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, X, CheckCheck, Users, Receipt, Landmark, MessageSquare, Settings, AlertTriangle } from "lucide-react";
import { cn } from "@dravik/shared";

type NotifCat = "lead" | "transaction" | "mortgage" | "message" | "system" | "alert";

interface Notif {
  id:    string;
  cat:   NotifCat;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
}

const CAT_CFG: Record<NotifCat, { icon: React.ElementType; iconCls: string; bgCls: string }> = {
  lead:        { icon: Users,         iconCls: "text-blue-600",    bgCls: "bg-blue-50"    },
  transaction: { icon: Receipt,       iconCls: "text-emerald-600", bgCls: "bg-emerald-50" },
  mortgage:    { icon: Landmark,      iconCls: "text-amber-600",   bgCls: "bg-amber-50"   },
  message:     { icon: MessageSquare, iconCls: "text-violet-600",  bgCls: "bg-violet-50"  },
  system:      { icon: Settings,      iconCls: "text-gray-500",    bgCls: "bg-surface-2"  },
  alert:       { icon: AlertTriangle, iconCls: "text-amber-600",   bgCls: "bg-amber-50"   },
};

const INITIAL_NOTIFS: Notif[] = [
  { id:"n1",  cat:"lead",        read:false, time:"2m ago",    title:"New lead assigned",       body:"Jordan Kim was assigned to your pipeline from Zillow."             },
  { id:"n2",  cat:"transaction", read:false, time:"14m ago",   title:"Document signed",         body:"Daniel Morales signed the Purchase Agreement on 12 Ocean Dr."      },
  { id:"n3",  cat:"mortgage",    read:false, time:"1h ago",    title:"Loan approved",           body:"Chloe Nguyen's FHA loan was approved — moved to Closing."          },
  { id:"n4",  cat:"message",     read:false, time:"1h ago",    title:"Message from Elena",      body:"Elena Rodriguez: 'Can you review the rate estimate for m3?'"        },
  { id:"n5",  cat:"alert",       read:false, time:"3h ago",    title:"License expiring soon",   body:"Marcus Johnson's DRE license expires in 32 days. Renew now."       },
  { id:"n6",  cat:"lead",        read:true,  time:"5h ago",    title:"Behavior score updated",  body:"Sarah Johnson's score jumped to 95 — high-intent buyer signal."    },
  { id:"n7",  cat:"transaction", read:true,  time:"6h ago",    title:"Closing date updated",    body:"Tx on 45 Birchwood Ln rescheduled to Jun 12, 2026."                },
  { id:"n8",  cat:"mortgage",    read:true,  time:"Yesterday", title:"Condition satisfied",     body:"LTV condition waived for application m5 by James Park."           },
  { id:"n9",  cat:"system",      read:true,  time:"Yesterday", title:"Twilio sync complete",    body:"Integration synced 24 new SMS conversations successfully."         },
  { id:"n10", cat:"lead",        read:true,  time:"2d ago",    title:"Referral lead received",  body:"Marcus Thompson sent a referral: David & Amy Park."               },
  { id:"n11", cat:"transaction", read:true,  time:"2d ago",    title:"Inspection scheduled",    body:"Inspection booked for 91 Cedar Ridge on Jun 2 at 10am."            },
  { id:"n12", cat:"mortgage",    read:true,  time:"3d ago",    title:"New application",         body:"Pre-qual submitted by Evan & Rachel Torres."                       },
  { id:"n13", cat:"message",     read:true,  time:"3d ago",    title:"Campaign sent",           body:"'Spring Listings 2026' deployed to 148 contacts successfully."     },
  { id:"n14", cat:"alert",       read:true,  time:"4d ago",    title:"Commission tier upgrade", body:"Sarah Chen reached Top Producer — split is now 82/18."             },
  { id:"n15", cat:"system",      read:true,  time:"5d ago",    title:"Settings saved",          body:"Notification preferences updated by Chris Macabugao."             },
];

// ─── NotifRow ─────────────────────────────────────────────────
function NotifRow({ notif, onRead }: { notif: Notif; onRead: (id: string) => void }) {
  const cfg  = CAT_CFG[notif.cat];
  const Icon = cfg.icon;
  return (
    <button
      onClick={() => onRead(notif.id)}
      className={cn(
        "w-full text-left flex items-start gap-3 px-5 py-3.5 border-b border-line last:border-0 transition-colors hover:bg-surface/50",
        !notif.read && "bg-gold/[0.04]"
      )}
    >
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bgCls)}>
        <Icon size={14} className={cfg.iconCls} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn("text-xs truncate leading-snug", notif.read ? "font-medium text-dravik-dark" : "font-bold text-dravik-dark")}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />}
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{notif.body}</p>
        <p className="text-[10px] text-gray-300 mt-1 font-medium">{notif.time}</p>
      </div>
    </button>
  );
}

// ─── NotificationCenter ───────────────────────────────────────
export default function NotificationCenter() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [open,   setOpen]   = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") handleClose(); }
    function onOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) handleClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [open, handleClose]);

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell trigger */}
      <button
        aria-label={`Notifications${unread ? ` — ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="relative p-2.5 rounded-xl text-gray-400 hover:bg-surface-2 hover:text-dravik-dark transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-[9px] right-[9px] w-2 h-2 rounded-full bg-gold ring-2 ring-white" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] max-h-[560px] flex flex-col bg-white border border-line rounded-2xl shadow-2xl overflow-hidden animate-slide-up z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-line flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gold" />
              <h3 className="text-sm font-bold text-dravik-dark">Notifications</h3>
              {unread > 0 && (
                <span className="text-[10px] font-bold text-white bg-gold px-1.5 py-0.5 rounded-full leading-none">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] font-semibold text-gold hover:text-gold-dark transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button
                onClick={handleClose}
                aria-label="Close notifications"
                className="p-1 rounded-lg text-gray-400 hover:text-dravik-dark hover:bg-surface-2 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifs.map(n => <NotifRow key={n.id} notif={n} onRead={markRead} />)}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-3 border-t border-line bg-surface-2 text-center">
            <p className="text-[11px] text-gray-400">
              {unread === 0 ? "All caught up!" : `${unread} unread notification${unread !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
