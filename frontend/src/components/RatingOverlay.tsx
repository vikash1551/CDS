import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { CourierAvatar } from "./courier/CourierAvatar";
import { toast } from "sonner";

export function RatingOverlay({
  isOpen,
  onClose,
  courierName = "Rahul",
  courierGender = "male",
}: {
  isOpen: boolean;
  onClose: () => void;
  courierName?: string;
  courierGender?: "male" | "female";
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = ["⚡ Fast Delivery", "😊 Polite", "📦 Careful", "🎯 Easy to Find"];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating first.");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Feedback submitted! +10 Campus Points 🎉");
      onClose();
      // Reset after close
      setTimeout(() => {
        setRating(0);
        setFeedback("");
        setSelectedTags([]);
      }, 300);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[32px] border-t border-border bg-card p-6 shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-[32px] md:border"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <CourierAvatar gender={courierGender} size={64} isMoving={false} />
              </div>
              <h2 className="text-xl font-bold">How was {courierName}?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your feedback helps us improve campus deliveries.
              </p>

              {/* Stars */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-9 w-9 ${
                        star <= (hoverRating || rating)
                          ? "fill-warning text-warning"
                          : "fill-secondary text-secondary"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="w-full mt-6"
                  >
                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                            selectedTags.includes(tag)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground/50"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Feedback Input */}
                    <textarea
                      placeholder="Add a comment (optional)..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full resize-none rounded-2xl border border-border bg-secondary/50 p-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
                      rows={3}
                    />

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-pop transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Rating"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
