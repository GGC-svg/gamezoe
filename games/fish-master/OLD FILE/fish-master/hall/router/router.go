package router

import (
	"fish/hall/controllers"
	"net/http"
)

func init() {
	http.HandleFunc("/get_serverinfo", controllers.GetServerInfo)
	http.HandleFunc("/guest", controllers.Guest)
	http.HandleFunc("/login", controllers.Login)
	http.HandleFunc("/get_user_status", controllers.GetUserStatus)
	http.HandleFunc("/get_message", controllers.GetMessage)
	http.HandleFunc("/enter_public_room", controllers.EnterPublicRoom)
	http.HandleFunc("/register_game_server", controllers.RegisterGameServer)

	// Admin login (use simple version as default)
	http.HandleFunc("/admin/login", controllers.SimpleAdminLogin)
	http.HandleFunc("/simple/admin/login", controllers.SimpleAdminLogin)
	
	// Static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("hall/static/"))))
}
