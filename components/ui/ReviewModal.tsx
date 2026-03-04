"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { submitReview } from "@/lib/actions/review.actions"
import { toast } from "@/hooks/use-toast"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  doctorId: string
  doctorName: string
  patientId: string
  patientName: string
  onSuccess: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  appointmentId,
  doctorId,
  doctorName,
  patientId,
  patientName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Error", description: "Please select a star rating.", variant: "destructive" })
      return
    }
    if (description.trim().length < 5) {
      toast({ title: "Error", description: "Please write at least a short review.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitReview({
        doctorId,
        doctorName,
        patientId,
        patientName,
        appointmentId,
        rating,
        description: description.trim(),
      })

      if (result.success) {
        toast({ title: "Review submitted!", description: "Thank you for your feedback." })
        onSuccess()
        onClose()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHovered(0)
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-teal-950 border border-teal-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Review Dr. {doctorName}</DialogTitle>
          <DialogDescription className="text-teal-300 text-sm">
            Share your experience to help other patients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Star Rating */}
          <div>
            <p className="text-sm font-medium mb-2 text-teal-100">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-teal-700 fill-teal-900"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-teal-400 mt-1">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium mb-2 text-teal-100">Your Review</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your experience with this doctor..."
              maxLength={1000}
              rows={4}
              className="bg-teal-900/50 border-teal-700 text-white placeholder:text-teal-500 resize-none focus:border-teal-400 focus:ring-0"
            />
            <p className="text-xs text-teal-500 text-right mt-1">{description.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-teal-700 bg-transparent text-teal-300 hover:bg-teal-900 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-teal-700 hover:bg-teal-600 text-white border-none"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
