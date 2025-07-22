# Shoulder Pain Tracker

A simple, clean, and modern web application to help users track pain levels over time. The app is designed to be easy to use, fully responsive, and syncs across devices using Google authentication.

## Features

* **Secure Authentication:** Users can sign in with their Google account, ensuring data is private and accessible across devices.
* **Pain Entry:** A simple interface to add a new pain entry with a level from 0-10, automatically timestamped.
* **Data Visualization:** A line chart visualizes pain levels over time, with filters to view data from the last 7 days, 30 days, or all time.
* **Definitions Tab:** Quick reference explaining each pain level from 0-10.
* **Cross-Device Sync:** All data is stored in Firestore and linked to the user's Google account, making it available on any phone, tablet, or computer.
* **Responsive Design:** The interface is built with Tailwind CSS to work seamlessly on all screen sizes.
* **Testing Mode:** Add `?test` to the URL to bypass authentication and store data only in memory.

## Tech Stack

* **Frontend:**
    * HTML5
    * [Tailwind CSS](https://tailwindcss.com/) for styling.
    * [Chart.js](https://www.chartjs.org/) for data visualization.
* **Backend:**
    * [Firebase Authentication](https://firebase.google.com/docs/auth) for Google Sign-In.
    * [Cloud Firestore](https://firebase.google.com/docs/firestore) as the real-time, serverless database.
* **Deployment:**
    * Hosted on [GitHub Pages](https://pages.github.com/).

## Setup and Deployment

To deploy your own instance of this application, follow these steps:

**1. Create a Firebase Project:**
* Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
* Add a new **Web App** to your project.
* Copy the `firebaseConfig` object provided.

**2. Configure Firebase Services:**
* **Authentication:**
    * In your Firebase project, go to the **Authentication** section.
    * On the "Sign-in method" tab, enable **Google** as a provider.
    * On the "Settings" tab, add the domains where you will host the app to the **Authorized domains** list (e.g., `your-username.github.io` for GitHub Pages).
* **Firestore:**
    * Go to the **Firestore Database** section and create a new database in **Production mode**.
    * In the **Rules** tab, paste the following security rules to ensure users can only access their own data:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /artifacts/{appId}/users/{userId}/{documents=**} {
              allow read, write, delete: if request.auth != null && request.auth.uid == userId;
            }
          }
        }
        ```

**3. Update the Code:**
* In the `index.html` file, find the `firebaseConfig` variable.
* Replace the placeholder object with the one you copied from your Firebase project.

**4. Deploy:**
* Create a new public repository on GitHub.
* Add your `index.html` file to the repository.
* In the repository settings under **Pages**, select the `main` branch to deploy from.
* Your app will be live at `https://your-username.github.io/your-repo-name/`.

## How to Use

0.  **Testing Mode:** Append `?test` to the URL to try the app without signing in. Data will reset when the page reloads.
1.  **Sign In:** Open the application and click the "Sign in with Google" button.
2.  **Add an Entry:** Click the large "+" button at the bottom right to open the entry modal. Select a pain level and click "Save Entry".
3.  **View History:** Your entries will appear in a list on the "Entries" tab. You can delete an entry using the trash can icon.
4.  **Analyze Trends:** Click the "Chart" tab to see a graph of your pain levels over time. Use the filter buttons to change the time period.
5.  **Sign Out:** Click the "Sign Out" button in the header to log out of your account.
