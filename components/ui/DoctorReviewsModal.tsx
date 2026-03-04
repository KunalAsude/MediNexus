"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Star, MessageSquare } from "lucide-react"
import { getReviewsByDoctor } from "@/lib/actions/review.actions"

interface Review {
  _id: string
  patientName: string
  rating: number
  description: string
  createdAt: string
}

interface DoctorReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: string
  doctorName: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-teal-700 fill-teal-900"}`}
        />
      ))}
    </div>
  )
}

function AverageRating({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return (
    <div className="flex items-center gap-2 mb-5 bg-teal-900/40 p-3 rounded-lg border border-teal-800">
      <div className="text-3xl font-bold text-yellow-400">{avg.toFixed(1)}</div>
      <div>
        <StarRating rating={Math.round(avg)} />
        <p className="text-xs text-teal-400 mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
      </div>
    </div>
  )
}

export function DoctorReviewsModal({ isOpen, onClose, doctorId, doctorName }: DoctorReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && doctorId) {
      const fetchReviews = async () => {
        setIsLoading(true)
        try {
          const data = await getReviewsByDoctor(doctorId)
          setReviews(data || [])
        } catch {
          setReviews([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchReviews()
    }
  }, [isOpen, doctorId])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-teal-950 border border-teal-800 text-white max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Reviews for Dr. {doctorName}</DialogTitle>
          <DialogDescription className="text-teal-300 text-sm">
            Patient feedback from completed appointments
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1 space-y-3 mt-2">
          {isLoading ? (
            <div className="text-center py-10 text-teal-400">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-teal-400 flex flex-col items-center gap-3">
              <MessageSquare className="h-10 w-10 opacity-40" />
              <p>No reviews yet for this doctor.</p>
            </div>
          ) : (
            <>
              <AverageRating reviews={reviews} />
              {reviews.map((review) => (
                <div key={review._id} className="bg-teal-900/40 border border-teal-800 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-teal-100">{review.patientName}</p>
                    <p className="text-xs text-teal-500">{formatDate(review.createdAt)}</p>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-teal-200 leading-relaxed">{review.description}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
