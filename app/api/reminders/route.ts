// app/api/reminders/route.ts
import connect from "@/lib/mongodb";
import { sendReminderEmails } from "@/lib/actions/sendEmails";

export async function GET() {
  await connect();
  
  try {
    const reminderResults = await sendReminderEmails();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Reminder process complete. Sent ${reminderResults.sentCount} reminders.`,
        details: reminderResults
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reminder process:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to process reminders",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}