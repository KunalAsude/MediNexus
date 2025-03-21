"use client"

import { useState } from "react"
import { X, AlertTriangle, Calendar, Clock, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const CANCELLATION_REASONS = [
  "Schedule conflict",
  "No longer needed",
  "Feeling better",
  "Need to reschedule",
  "Transportation issues",
  "Financial reasons",
  "Other (please specify)",
]

export interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading?: boolean
  appointmentDetails?: {
    doctorName?: string
    date?: string
    time?: string
  }
}

export function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  appointmentDetails,
}: CancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [otherReason, setOtherReason] = useState("")

  const handleConfirm = () => {
    const finalReason = selectedReason === "Other (please specify)" ? otherReason : selectedReason
    onConfirm(finalReason)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-teal-950 border-teal-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Cancel Appointment
          </DialogTitle>
        </DialogHeader>

        {appointmentDetails && (
          <div className="mt-1 mb-4 p-3 bg-teal-900/30 rounded-lg border border-teal-800">
            <h3 className="text-sm font-medium text-teal-300 mb-2">Appointment Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-teal-400" />
                <span className="text-teal-100">{appointmentDetails.doctorName || "Doctor"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-400" />
                <span className="text-teal-100">{appointmentDetails.date || "Scheduled date"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-400" />
                <span className="text-teal-100">{appointmentDetails.time || "Scheduled time"}</span>
              </div>
            </div>
          </div>
        )}

        <DialogDescription className="text-teal-300 mb-2">
          Please provide a reason for cancellation.
        </DialogDescription>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={selectedReason}
            onValueChange={setSelectedReason}
            className="space-y-3 bg-teal-900/50 p-3 rounded-lg"
          >
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason.replace(/\s+/g, "-").toLowerCase()} className="border-teal-500" />
                <Label
                  htmlFor={reason.replace(/\s+/g, "-").toLowerCase()}
                  className="text-sm font-medium text-teal-100 cursor-pointer"
                >
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === "Other (please specify)" && (
            <div className="space-y-2">
              <Label htmlFor="other-reason" className="text-sm font-medium text-teal-100">
                Please specify your reason
              </Label>
              <Textarea
                id="other-reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please provide details..."
                className="bg-teal-900/30 border-teal-800 text-white placeholder:text-teal-400 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-transparent hover:bg-teal-900 text-teal-300 border-teal-700"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === "Other (please specify)" && !otherReason) || isLoading}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            {isLoading ? "Processing..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}