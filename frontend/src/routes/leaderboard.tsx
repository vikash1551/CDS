import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";
import { Trophy, Flame, Star, Medal, Bike, Award, ChevronUp, Zap } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — UniDrop" },
      { name: "description", content: "Campus runner rankings, EXP, and badges." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const fallbackRunners = [
    { rank: 1, name: "Aarav S.", avatar: "🧑‍🎓", dept: "CSE · 2nd yr", drops: 124, exp: 6200, streak: 14, rating: 4.9 },
    { rank: 2, name: "Priya K.", avatar: "👩‍🎓", dept: "ECE · 3rd yr", drops: 98, exp: 4900, streak: 8, rating: 4.9 },
    { rank: 3, name: "Rohan M.", avatar: "🧑", dept: "ME · 2nd yr", drops: 87, exp: 4350, streak: 6, rating: 4.7 },
    { rank: 4, name: "Sneha R.", avatar: "👩", dept: "IT · 3rd yr", drops: 72, exp: 3600, streak: 4, rating: 4.6 },
    { rank: 5, name: "Kabir J.", avatar: "🧑‍💻", dept: "Design · 2nd yr", drops: 65, exp: 3250, streak: 3, rating: 4.5 },
    { rank: 6, name: "Meera P.", avatar: "👩‍🔬", dept: "Chem · 4th yr", drops: 58, exp: 2900, streak: 2, rating: 4.8 },
    { rank: 7, name: "Arjun T.", avatar: "🧑‍🔧", dept: "Civil · 3rd yr", drops: 45, exp: 2250, streak: 1, rating: 4.4 },
    { rank: 8, name: "You", avatar: "🧑‍🎓", dept: "CSE · 3rd yr", drops: 38, exp: 1280, streak: 2, rating: 4.9 },
  ];

  const [runners, setRunners] = useState(fallbackRunners);

  useEffect(() => {
    api.get('/leaderboard')
      .then((res) => {
        const board = res.data.leaderboard || [];
        if (board.length > 0) {
          // Merge backend data with fallback to always have 8 entries
          const merged = board.map((b: any, i: number) => ({
            rank: b.rank || i + 1,
            name: b.name,
            avatar: "🧑‍🎓",
            dept: b.badge || "Campus",
            drops: Math.floor((b.xp || 0) / 50),
            exp: b.xp || 0,
            streak: Math.min(Math.floor((b.xp || 0) / 200), 30),
            rating: 4.5 + Math.random() * 0.5,
          }));
          // Pad with fallback if less than 8
          const final = [...merged, ...fallbackRunners.slice(merged.length)].slice(0, 8)
            .map((r: any, i: number) => ({ ...r, rank: i + 1 }));
          setRunners(final);
        }
      })
      .catch(() => {});
  }, []);

  const you = runners[runners.length - 1];

  const badges = [
    { emoji: "🚀", name: "Speed Demon", desc: "10 deliveries under 8 min", earned: true },
    { emoji: "🔥", name: "Hot Streak", desc: "7-day delivery streak", earned: true },
    { emoji: "⭐", name: "5-Star Runner", desc: "Maintain 4.8+ rating", earned: true },
    { emoji: "🏆", name: "Century Club", desc: "Complete 100 deliveries", earned: false },
    { emoji: "🌙", name: "Night Owl", desc: "10 deliveries after 10 PM", earned: false },
    { emoji: "💎", name: "Diamond Tier", desc: "Reach 10,000 EXP", earned: false },
  ];

  return (
    <MobileShell>
      <TopBar title="Leaderboard" />

      {/* Your Stats */}
      <div className="bg-gradient-primary px-4 pb-8 pt-3 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-3xl ring-4 ring-card/20">
            🧑‍🎓
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">Vihaan Reddy</p>
            <p className="text-[11px] opacity-80">Rank #{you.rank} · CSE 3rd yr</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{you.exp.toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-70">EXP</p>
          </div>
        </div>

        {/* EXP Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-semibold opacity-80">
            <span>Silver Tier</span>
            <span>Gold Tier — 2,000 EXP</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-card/20">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${(you.exp / 2000) * 100}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-card/15 p-3 backdrop-blur text-center">
            <Bike className="mx-auto h-4 w-4 mb-1" />
            <p className="text-lg font-bold">{you.drops}</p>
            <p className="text-[9px] opacity-70">Deliveries</p>
          </div>
          <div className="rounded-2xl bg-card/15 p-3 backdrop-blur text-center">
            <Flame className="mx-auto h-4 w-4 mb-1" />
            <p className="text-lg font-bold">{you.streak}</p>
            <p className="text-[9px] opacity-70">Day Streak</p>
          </div>
          <div className="rounded-2xl bg-card/15 p-3 backdrop-blur text-center">
            <Star className="mx-auto h-4 w-4 mb-1 fill-current" />
            <p className="text-lg font-bold">{you.rating}</p>
            <p className="text-[9px] opacity-70">Rating</p>
          </div>
        </div>
      </div>

      <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-6 pt-5">
        {/* Badges Section */}
        <div className="mb-5">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" /> Your Badges
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {badges.map((b) => (
              <div
                key={b.name}
                className={`rounded-2xl border p-3 text-center transition-all ${
                  b.earned
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card opacity-40 grayscale"
                }`}
              >
                <span className="text-2xl">{b.emoji}</span>
                <p className="mt-1 text-[10px] font-bold leading-tight">{b.name}</p>
                <p className="mt-0.5 text-[9px] text-muted-foreground leading-tight">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
          <Trophy className="h-4 w-4 text-warning" /> Campus Rankings
        </h3>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-3 mb-5">
          {[runners[1], runners[0], runners[2]].map((r, i) => {
            const heights = ["h-20", "h-28", "h-16"];
            const medals = ["🥈", "🥇", "🥉"];
            const sizes = ["h-11 w-11 text-xl", "h-14 w-14 text-2xl", "h-10 w-10 text-lg"];
            return (
              <div key={r.rank} className="flex flex-col items-center">
                <span className={`flex items-center justify-center rounded-full bg-secondary ${sizes[i]} ring-2 ring-border`}>
                  {r.avatar}
                </span>
                <p className="mt-1 text-[10px] font-bold">{r.name}</p>
                <p className="text-[9px] text-muted-foreground">{r.exp.toLocaleString()} XP</p>
                <div
                  className={`${heights[i]} w-16 mt-1 rounded-t-xl flex items-start justify-center pt-2 text-xl ${
                    i === 1 ? "bg-warning/20" : "bg-secondary"
                  }`}
                >
                  {medals[i]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full List */}
        <div className="space-y-1.5">
          {runners.slice(3).map((r) => (
            <div
              key={r.rank}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                r.name === "You"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">#{r.rank}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-lg">
                {r.avatar}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.name} {r.name === "You" && <span className="text-primary text-[10px]">(You)</span>}</p>
                <p className="text-[10px] text-muted-foreground">{r.dept} · {r.drops} drops</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold flex items-center gap-0.5">
                  <Zap className="h-3 w-3 text-warning" /> {r.exp.toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">EXP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
