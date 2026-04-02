"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dices } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { pickGame, assignChosenOne } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnimationType = "ticker" | "slotMachine" | "elimination" | "wheel" | "shuffleDeck";

const ANIMATION_NAMES: Record<AnimationType, string> = {
  ticker: "Rapid Ticker",
  slotMachine: "Slot Machine",
  elimination: "Elimination",
  wheel: "Spin the Wheel",
  shuffleDeck: "Card Shuffle",
};

type Member = {
  user_id: string;
  display_name: string;
};

type Props = {
  choreId: string;
  members: Member[];
  disabled?: boolean;
};

export function GameRandomizerModal({ choreId, members, disabled }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "animating" | "result">("idle");
  const [animationType, setAnimationType] = useState<AnimationType>("ticker");
  const [allGames, setAllGames] = useState<string[]>([]);
  const [chosenGame, setChosenGame] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [assignPending, setAssignPending] = useState(false);
  const gamePickedRef = useRef(false);

  const startRandomizer = useCallback(async () => {
    setPhase("animating");

    const result = await pickGame(choreId);
    if (result.error || !result.gameName || !result.allGameNames) {
      toast.error(result.error ?? "Failed to pick a game");
      setOpen(false);
      setPhase("idle");
      return;
    }

    gamePickedRef.current = true;
    const animations: AnimationType[] = ["ticker", "slotMachine", "elimination", "wheel", "shuffleDeck"];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];

    setAllGames(result.allGameNames);
    setChosenGame(result.gameName);
    setAnimationType(randomAnim);
  }, [choreId]);

  useEffect(() => {
    if (open && phase === "idle") {
      startRandomizer();
    }
  }, [open, phase, startRandomizer]);

  // When modal closes, refresh the page to reflect any changes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (gamePickedRef.current) {
        router.refresh();
        gamePickedRef.current = false;
      }
      setPhase("idle");
      setSelectedMember("");
    }
  };

  const handleAnimationEnd = () => {
    setPhase("result");
  };

  const handleAssign = async () => {
    if (!selectedMember) return;
    setAssignPending(true);
    const result = await assignChosenOne(choreId, selectedMember);
    setAssignPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      gamePickedRef.current = false;
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Dices className="mr-1 size-4" />
          Pick a game
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {phase === "result" ? "The game is..." : "Picking a game..."}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          {phase === "animating" && allGames.length > 0 && (
            <>
              <p className="mb-4 text-xs text-muted-foreground">
                {ANIMATION_NAMES[animationType]}
              </p>
              {animationType === "ticker" && (
                <TickerAnimation games={allGames} winner={chosenGame} onEnd={handleAnimationEnd} />
              )}
              {animationType === "slotMachine" && (
                <SlotMachineAnimation games={allGames} winner={chosenGame} onEnd={handleAnimationEnd} />
              )}
              {animationType === "elimination" && (
                <EliminationAnimation games={allGames} winner={chosenGame} onEnd={handleAnimationEnd} />
              )}
              {animationType === "wheel" && (
                <WheelAnimation games={allGames} winner={chosenGame} onEnd={handleAnimationEnd} />
              )}
              {animationType === "shuffleDeck" && (
                <ShuffleDeckAnimation games={allGames} winner={chosenGame} onEnd={handleAnimationEnd} />
              )}
            </>
          )}
          {phase === "result" && (
            <div className="w-full space-y-5 animate-in fade-in zoom-in duration-300">
              <p className="text-center text-3xl font-bold">{chosenGame}</p>
              <p className="text-center text-sm text-muted-foreground">
                Play the game, then select the chosen one:
              </p>
              <div className="space-y-3">
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select the chosen one" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={handleAssign}
                  disabled={assignPending || !selectedMember}
                >
                  {assignPending ? "Assigning…" : "Assign"}
                </Button>
              </div>
            </div>
          )}
          {phase === "animating" && allGames.length === 0 && (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Animation 1: Rapid Ticker ─── */
function TickerAnimation({
  games,
  winner,
  onEnd,
}: {
  games: string[];
  winner: string;
  onEnd: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    let tick = 0;
    let delay = 60;
    const maxTicks = 60 + Math.floor(Math.random() * 15);

    function step() {
      tick++;
      if (tick >= maxTicks) {
        setCurrent(games.indexOf(winner));
        setStopped(true);
        setTimeout(onEnd, 800);
        return;
      }
      setCurrent((prev) => (prev + 1) % games.length);
      delay = 60 + (tick / maxTicks) * 400;
      setTimeout(step, delay);
    }

    setTimeout(step, delay);
  }, [games, winner, onEnd]);

  return (
    <div className="relative h-16 w-64 overflow-hidden rounded-lg border bg-muted/50">
      <div
        className={`flex h-full items-center justify-center text-xl font-bold transition-all ${
          stopped ? "text-primary scale-110" : "blur-[0.5px]"
        }`}
      >
        {games[current]}
      </div>
    </div>
  );
}

/* ─── Animation 2: Slot Machine ─── */
function SlotMachineAnimation({
  games,
  winner,
  onEnd,
}: {
  games: string[];
  winner: string;
  onEnd: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const itemHeight = 48;
  const reel = [...Array(16)].flatMap(() => games);
  reel.push(winner);
  const finalOffset = (reel.length - 1) * itemHeight;

  useEffect(() => {
    const t = setTimeout(() => setOffset(finalOffset), 50);
    const endTimer = setTimeout(() => {
      setDone(true);
      onEnd();
    }, 6500);
    return () => {
      clearTimeout(t);
      clearTimeout(endTimer);
    };
  }, [finalOffset, onEnd]);

  return (
    <div
      className="relative w-64 overflow-hidden rounded-lg border bg-muted/50"
      style={{ height: `${itemHeight * 5}px`, perspective: "300px" }}
    >
      {/* Fade overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />
      <div
        className="transition-transform duration-[6000ms] ease-[cubic-bezier(0.15,0.85,0.3,1)]"
        style={{ transform: `translateY(-${offset - itemHeight * 2}px)` }}
      >
        {reel.map((name, i) => (
          <div
            key={i}
            className={`flex items-center justify-center text-lg font-bold ${
              done && i === reel.length - 1 ? "text-primary" : ""
            }`}
            style={{ height: `${itemHeight}px` }}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Animation 3: Elimination ─── */
function EliminationAnimation({
  games,
  winner,
  onEnd,
}: {
  games: string[];
  winner: string;
  onEnd: () => void;
}) {
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [flashing, setFlashing] = useState<string | null>(null);

  useEffect(() => {
    const toEliminate = games.filter((g) => g !== winner);
    let i = 0;

    function eliminateNext() {
      if (i >= toEliminate.length) {
        setTimeout(onEnd, 1200);
        return;
      }
      setFlashing(toEliminate[i]);
      setTimeout(() => {
        setEliminated((prev) => new Set(prev).add(toEliminate[i]));
        setFlashing(null);
        i++;
        setTimeout(eliminateNext, 900);
      }, 700);
    }

    setTimeout(eliminateNext, 1000);
  }, [games, winner, onEnd]);

  return (
    <div className="flex flex-col gap-2 w-64">
      {games.map((game) => {
        const isEliminated = eliminated.has(game);
        const isFlashing = flashing === game;
        const isWinner = game === winner && eliminated.size === games.length - 1;
        return (
          <div
            key={game}
            className={`rounded-lg border px-4 py-2 text-center font-medium transition-all duration-300 ${
              isEliminated
                ? "line-through opacity-20 scale-95"
                : isFlashing
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : isWinner
                    ? "border-primary bg-primary/10 text-primary scale-105 font-bold"
                    : "bg-muted/50"
            }`}
          >
            {game}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Animation 4: Spin the Wheel ─── */
function WheelAnimation({
  games,
  winner,
  onEnd,
}: {
  games: string[];
  winner: string;
  onEnd: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const segmentAngle = 360 / games.length;
  const winnerIndex = games.indexOf(winner);
  const targetAngle = 360 * 10 + (360 - winnerIndex * segmentAngle - segmentAngle / 2);

  useEffect(() => {
    const t = setTimeout(() => setRotation(targetAngle), 50);
    const endTimer = setTimeout(onEnd, 8200);
    return () => {
      clearTimeout(t);
      clearTimeout(endTimer);
    };
  }, [targetAngle, onEnd]);

  const colors = [
    "fill-blue-100 dark:fill-blue-900",
    "fill-green-100 dark:fill-green-900",
    "fill-yellow-100 dark:fill-yellow-900",
    "fill-orange-100 dark:fill-orange-900",
    "fill-purple-100 dark:fill-purple-900",
    "fill-pink-100 dark:fill-pink-900",
  ];

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 text-primary">
        <svg width="20" height="16" viewBox="0 0 20 16">
          <polygon points="10,16 0,0 20,0" fill="currentColor" />
        </svg>
      </div>
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        className="transition-transform duration-[8000ms] ease-[cubic-bezier(0.15,0.85,0.25,1)]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {games.map((game, i) => {
          const startAngle = i * segmentAngle;
          const endAngle = (i + 1) * segmentAngle;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = 120 + 110 * Math.cos(startRad);
          const y1 = 120 + 110 * Math.sin(startRad);
          const x2 = 120 + 110 * Math.cos(endRad);
          const y2 = 120 + 110 * Math.sin(endRad);
          const largeArc = segmentAngle > 180 ? 1 : 0;
          const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
          const textX = 120 + 65 * Math.cos(midAngle);
          const textY = 120 + 65 * Math.sin(midAngle);
          const textRotation = (startAngle + endAngle) / 2;

          return (
            <g key={game}>
              <path
                d={`M120,120 L${x1},${y1} A110,110 0 ${largeArc},1 ${x2},${y2} Z`}
                className={`${colors[i % colors.length]} stroke-border`}
                strokeWidth="1"
              />
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                className="fill-foreground text-[9px] font-medium"
              >
                {game.length > 16 ? game.slice(0, 14) + "…" : game}
              </text>
            </g>
          );
        })}
        <circle cx="120" cy="120" r="18" className="fill-background stroke-border" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ─── Animation 5: Card Shuffle ─── */
function ShuffleDeckAnimation({
  games,
  winner,
  onEnd,
}: {
  games: string[];
  winner: string;
  onEnd: () => void;
}) {
  const [phase, setPhase] = useState<"scatter" | "gather" | "reveal">("scatter");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("gather"), 3000);
    const t2 = setTimeout(() => {
      setPhase("reveal");
      setRevealed(true);
    }, 5500);
    const t3 = setTimeout(onEnd, 7000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onEnd]);

  const offsets = games.map((_, i) => ({
    x: (i - Math.floor(games.length / 2)) * 30 + (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 40,
    rotate: (Math.random() - 0.5) * 30,
  }));

  return (
    <div className="relative h-40 w-64 flex items-center justify-center">
      {games.map((game, i) => {
        const isWinner = game === winner;
        const scattered = phase === "scatter";
        const reveal = phase === "reveal" && isWinner;

        return (
          <div
            key={game}
            className={`absolute rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm transition-all duration-700 ${
              reveal
                ? "bg-primary text-primary-foreground scale-110 z-20"
                : phase === "reveal" && !isWinner
                  ? "opacity-0 scale-75"
                  : "bg-background"
            }`}
            style={{
              transform: scattered
                ? `translate(${offsets[i].x}px, ${offsets[i].y}px) rotate(${offsets[i].rotate}deg)`
                : phase === "gather"
                  ? `translate(0, 0) rotate(${i * 2 - games.length}deg)`
                  : undefined,
              zIndex: isWinner ? 20 : games.length - i,
            }}
          >
            {revealed && isWinner ? game : scattered ? game : "?"}
          </div>
        );
      })}
    </div>
  );
}
