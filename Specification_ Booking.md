**Specification: Booking System Core — Focus on Calendar, Slots, and Scheduling**

---

## **✅ Existing Functionality**

* Registration for trainers (`User`) and clients (`Client`)  
* Calendar UI with available and booked slots  
* Trainer can:  
  * Create/edit/delete appointments  
  * Define working hours and slot durations  
  * View client list and statistics  
  * Edit profile and toggle Telegram reminders  
* Client can:  
  * Register via referral code  
  * View trainer calendar  
  * Book/cancel appointments  
* Telegram bot: sends reminders 2 hours before session

---

## **🎯 Goal: Focus on Booking Logic**

To make the booking experience seamless, flexible, and secure — for both trainers and clients — while scaling core logic for future payment, group sessions, and analytics.

---

## **📦 Core Entities (Database Models Reference)**

### **`User` (trainer)**

* Owns appointments and clients  
* Has working hours (via `BusinessSettings`)  
* Can enable/disable reminders

### **`Client`**

* Belongs to a single trainer (`userId`)  
* Can book/cancel their own slots only

### **`Appointment`**

* Status: `scheduled`, `cancelled`, `pending`, `completed`  
* Contains `userId`, `clientId`, `date`, `duration`, `notes`  
* Optional: `cancellationReason`

### **`BusinessSettings`**

* Timezone  
* Slot duration (15–90 min)  
* Working hours (e.g. 10:00–19:00)  
* Excluded dates (`holidays`)

---

## **🔄 Booking Flow (Client Side)**

1. Client sees calendar for trainer → filtered view by `userId`  
2. System disables already booked or expired slots  
3. Client clicks on available slot  
4. Submits booking request (POST /api/appointments)  
5. Appointment created with:  
   * `status: scheduled`  
   * `clientId` \= current client  
   * `userId` \= trainer  
6. Confirmation sent (optional: email/Telegram)

---

## **❌ Cancellation Flow**

### **By Client:**

* Client opens My Appointments  
* Clicks cancel → modal to select cancellation reason  
* Status updated to `cancelled`, reason saved  
* Notification sent to trainer

### **By Trainer:**

* Opens schedule  
* Cancels session → must optionally provide reason  
* Client notified automatically

---

## **🔐 Constraints & Rules**

* Clients can only cancel/edit their own appointments  
* No double bookings: slot availability checks on server  
* Trainer cannot overlap their own sessions  
* Sessions can’t be created in the past

---

## **📊 Optional Enhancements**

* History tab: view all past appointments  
* Tag clients with notes (e.g. “often cancels”, “VIP”)  
* Notification logs (when/how/what sent)  
* Confirm/decline step (for future group sessions)

---

## **🔜 Recommended Next Priorities**

| Priority | Feature | Reason |
| ----- | ----- | ----- |
| High | Slot conflict prevention (backend) | Prevent double-booking |
| High | Confirmation screen after booking | UX clarity |
| Medium | Cancellation reason field | Useful data for trainers |
| Medium | My appointments UI (client) | Transparency, ownership |
| Low | Group sessions (phase 2\) | Expandable in future |
| Low | Email reminder fallback | If Telegram not enabled |

---

## **📌 Summary**

Your booking system is already well structured. The next step is to polish the slot management, secure the logic for concurrent booking, and provide transparency to clients. With a solid booking flow, the product becomes sticky and scalable for monetization.

