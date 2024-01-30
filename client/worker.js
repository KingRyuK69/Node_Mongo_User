self.addEventListener("push", (e) => {
  try {
    const data = e.data.json();
    console.log("Push Received...");

    if (!data.title) {
      console.error("No title provided for the notification");
      return;
    }

    const iconUrl =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    console.log("Icon URL:", iconUrl);

    self.registration.showNotification(data.title, {
      body: "Notified by Sohom",
      icon: iconUrl,
    });
  } catch (error) {
    console.error("Error in push event listener:", error);
  }
});
