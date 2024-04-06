export const askNotificationPermission = () => {
    	Notification.requestPermission().then(perm =>{
            if(perm==="granted"){
                console.log("Permisos garantizados")
            }
        })
  };

export const sentNotificationMessage = () => {
    new Notification(
        "Whanalisis",{
            body: "Tu analisis está listo",
        }
    )
};