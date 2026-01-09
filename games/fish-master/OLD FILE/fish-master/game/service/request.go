package service

import (
	"encoding/json"
	"fmt"
	"github.com/astaxie/beego/logs"
	"strconv"
	"strings"
	"time"
)

type UserLockFishReq struct {
	UserId  UserId `json:"userId"`
	ChairId int    `json:"chairId"`
	FishId  FishId `json:"fishId"`
}

type LaserCatchReq struct {
	UserId  UserId `json:"userId"`
	ChairId int    `json:"chairId"`
	Fishes  string `json:"fishes"`
	Sign    string `json:"sign"`
}

type UserFireLaserReq struct {
	UserId     UserId  `json:"userId"`
	ChairId    int     `json:"chairId"`
	BulletKind int     `json:"bulletKind"`
	BulletId   int     `json:"bulletId"`
	Angle      float64 `json:"angle"`
	Sign       string  `json:"sign"`
	LockFishId FishId  `json:"lockFishId"`
}

func wsRequest(req []byte, client *Client) {
	defer func() {
		if r := recover(); r != nil {
			logs.Error("wsRequest panic:%v ", r)
		}
	}()
	if req[0] == '4' && req[1] == '2' {
		reqJson := make([]string, 0)
		err := json.Unmarshal(req[2:], &reqJson)
		if err != nil {
			logs.Error("wsRequest json unmarshal err :%v", err)
			return
		}
		if client.Room == nil { //未登录
			logs.Info("未登录 login msg : %v", reqJson[0])
			if reqJson[0] == "login" {
				if len(reqJson) < 2 {
					return
				}
				//if reqByteData, ok := reqJson[1].([]byte); ok {
				logs.Debug("Login request data: %s", reqJson[1])
				reqData := make(map[string]interface{})
				if err := json.Unmarshal([]byte(reqJson[1]), &reqData); err == nil {
					logs.Debug("Successfully parsed login data")
					var roomIdStr string
					if roomIdVal, ok := reqData["roomId"]; ok {
						if roomIdString, ok := roomIdVal.(string); ok {
							roomIdStr = roomIdString
							logs.Debug("Parsed roomId as string: %s", roomIdStr)
						} else if roomIdFloat, ok := roomIdVal.(float64); ok {
							roomIdStr = strconv.FormatFloat(roomIdFloat, 'f', 0, 64)
							logs.Debug("Parsed roomId as number: %f -> %s", roomIdFloat, roomIdStr)
						} else {
							logs.Error("roomId has unexpected type: %T", roomIdVal)
						}
					} else {
						logs.Error("roomId not found in login data")
					}
					if roomIdStr != "" {
						if roomIdInt, err := strconv.Atoi(roomIdStr); err == nil {
						roomId := RoomId(roomIdInt)
						logs.Debug("Looking for room: %d", roomId)
						RoomMgr.RoomLock.Lock()
						logs.Info("login get lock...")
						defer RoomMgr.RoomLock.Unlock()
						defer logs.Info("login set free lock...")
						logs.Debug("Available rooms: %v", len(RoomMgr.Rooms))
						if room, ok := RoomMgr.Rooms[roomId]; ok {
							//if room.Status == GameStatusWaitBegin {
							//	room.Status = GameStatusFree
							//	room.Utils.BuildFishTrace()
							//}
							logs.Debug("send succ")
							client.Room = room
							room.ClientReqChan <- &clientReqData{
								client,
								reqJson,
							}
						} else {
							logs.Error("room %v, not exists", roomId)
						}
						} else {
							logs.Error("roomId %v err : %v", roomIdStr, err)
						}
					} else {
						logs.Error("roomId is empty")
					}
				} else {
					logs.Error("Failed to parse login JSON: %v", err)
				}
				//}
			} else {
				logs.Error("invalid act %v", reqJson[0])
			}
		} else {
			//logs.Debug("send req to room [%d] succ 2", client.Room.RoomId)
			client.Room.ClientReqChan <- &clientReqData{
				client,
				reqJson,
			}
		}
	} else {
		logs.Error("invalid message %v", req)
	}
}

//todo 弱类型语言写的东西重构简直堪比火葬场
func handleUserRequest(clientReq *clientReqData) {
	reqJson := clientReq.reqData
	client := clientReq.client
	if len(reqJson) > 0 {
		act := reqJson[0]
		switch act {
		case "login":
			//logs.Debug("login")
			if len(reqJson) < 2 {
				return
			}
			reqData := make(map[string]interface{})
			if err := json.Unmarshal([]byte(reqJson[1]), &reqData); err == nil {
				token := reqData["sign"]
				if token, ok := token.(string); ok {
					logs.Debug("token %v", token)
					// Get client userId from login data
					var clientUserId string
					if userIdVal, ok := reqData["userId"]; ok {
						if userIdStr, ok := userIdVal.(string); ok {
							clientUserId = userIdStr
							logs.Debug("Client userId: %s", clientUserId)
						}
					}
					
					// Find existing user in room or create mock user
					var foundUser *UserInfo
					logs.Debug("Room has %d users", len(client.Room.Users))
					
					// Try to find an existing user without a client connection
					for userId, userInfo := range client.Room.Users {
						logs.Debug("Found user %d, client: %v", userId, userInfo.client != nil)
						if userInfo.client == nil {
							foundUser = userInfo
							logs.Debug("Using existing user %d", userId)
							break
						}
					}
					
					// If no existing user found, create a mock user with client userId
					if foundUser == nil {
						logs.Debug("No existing user found, creating mock user with client userId")
						// Use client's userId for consistency
						var mockUserId UserId
						if clientUserId != "" {
							// Try to extract numeric part from client userId (e.g., "guest_123" -> 123)
							if len(clientUserId) > 6 && clientUserId[:6] == "guest_" {
								if userIdInt, err := strconv.ParseInt(clientUserId[6:], 10, 64); err == nil {
									mockUserId = UserId(userIdInt)
								} else {
									mockUserId = UserId(time.Now().UnixNano() / 1000000)
								}
							} else {
								mockUserId = UserId(time.Now().UnixNano() / 1000000)
							}
						} else {
							mockUserId = UserId(time.Now().UnixNano() / 1000000)
						}
						
						// Find next available seat (0-3 for 4-player game)
						nextSeatIndex := -1
						for seatIdx := 0; seatIdx < 4; seatIdx++ {
							seatTaken := false
							for _, userInfo := range client.Room.Users {
								if userInfo.SeatIndex == seatIdx {
									seatTaken = true
									break
								}
							}
							if !seatTaken {
								nextSeatIndex = seatIdx
								break
							}
						}
						
						if nextSeatIndex == -1 {
							logs.Error("Room is full, cannot add more users")
							return
						}
						
						foundUser = &UserInfo{
							UserId:     mockUserId,
							Score:      10000,
							Name:       fmt.Sprintf("Player_%s", clientUserId),
							Ready:      false,
							SeatIndex:  nextSeatIndex,
							Vip:        0,
							CannonKind: 1,
							Power:      1.0,
							LockFishId: 0,
							Online:     true,
						}
						client.Room.Users[mockUserId] = foundUser
						logs.Debug("Mock user created with ID %d for client %s", mockUserId, clientUserId)
					}
					
					// Always proceed with mock user
					if foundUser != nil {
						logs.Debug("Setting up client with mock user")
						foundUser.client = client
						foundUser.Online = true
						foundUser.Ip = "::1"
						client.UserInfo = foundUser
						logs.Debug("client userInfo get data...")
						seats := make([]interface{}, 0)
						cannonKindVip := map[int]int{0: 1, 1: 4, 2: 7, 3: 10, 4: 13, 5: 16, 6: 19}
						//todo check sign
						//score, _ := strconv.ParseFloat(fmt.Sprintf("%.3f", float64(foundUser.Score)/1000), 64)
						foundUser.ConversionScore, _ = strconv.ParseFloat(fmt.Sprintf("%.3f", float64(foundUser.Score)/1000), 64)
						for _, userInfo := range client.Room.Users {
							// Use client's userId format for all users to ensure consistency
							var displayUserId interface{}
							if userInfo == foundUser && clientUserId != "" {
								displayUserId = clientUserId // Use client's original userId
							} else {
								// For other users, construct the client-style userId
								displayUserId = fmt.Sprintf("guest_%d", userInfo.UserId)
							}
							
							// Special handling for current user if clientUserId is empty
							if userInfo == foundUser && clientUserId == "" {
								displayUserId = fmt.Sprintf("guest_%d", userInfo.UserId)
							}
							
							seats = append(seats, map[string]interface{}{
								"userId":    displayUserId,
								"ip":        "",
								"score":     userInfo.ConversionScore,
								"name":      userInfo.Name,
								"vip":       userInfo.Vip,
								"online":    true,
								"ready":     userInfo.Ready,
								"seatIndex": userInfo.SeatIndex,

								// 正在使用哪种炮 todo 换为真实vip
								"cannonKind": cannonKindVip[0],
								// 能量值
								"power": 0,
							})
						}
						logs.Debug("Sending login_result with seats: %+v", seats)
						client.sendToClient([]interface{}{
							"login_result",
							map[string]interface{}{
								"errcode": 0,
								"errmsg":  "ok",
								"data": map[string]interface{}{
									"roomId":     strconv.Itoa(int(client.Room.RoomId)),
									"conf":       client.Room.Conf,
									"numofgames": 0,
									"seats":      seats,
								},
							},
						})
						client.sendToOthers([]interface{}{
							"new_user_comes_push",
							client.UserInfo,
						})
						client.sendToClient([]interface{}{
							"login_finished",
						})
						return
					} else {
						//不用断开链接，客户端的问题导致需要保持很多无用链接。。。
						logs.Debug("user need enter room")
						client.closeChan <- true
						close(client.closeChan)
						return
					}
				}
			} else {
				logs.Error("json unmarshal err : %v", err)
			}
			client.Room = nil
		case "catch_fish":
			if len(reqJson) < 2 {
				return
			}
			//42["catch_fish","{\"userId\":101,\"chairId\":1,\"bulletId\":\"1_324965\",\"fishId\":\"10318923\",\"sign\":\"8bfef2b82dc7b97e4ad386ec40b83d2b\"}"]
			catchFishReq := catchFishReq{}
			if err := json.Unmarshal([]byte(reqJson[1]), &catchFishReq); err == nil {
				bulletId := catchFishReq.BulletId
				client.catchFish(catchFishReq.FishId, bulletId)
			} else {
				logs.Error("catch_fish req err: %v", err)
			}
		case "ready":
			if len(reqJson) < 2 {
				return
			}
			reqData := make(map[string]interface{})
			if err := json.Unmarshal([]byte(reqJson[1]), &reqData); err == nil {
				// For mock implementation, just mark the current client's user as ready
				if client.UserInfo != nil {
					client.UserInfo.Ready = true
					logs.Debug("User %d marked as ready", client.UserInfo.UserId)
				} else {
					logs.Error("Client has no UserInfo")
				}
				if client.Room.Status == GameStatusWaitBegin {
					client.Room.Status = GameStatusFree
					//client.Room.begin()
					client.Room.Utils.BuildFishTrace()
				}
				client.UserInfo.Online = true
				roomUsers := make([]*UserInfo, 0)
				for i := 0; i < 4; i++ {
					seatHasPlayer := false
					for _, userInfo := range client.Room.Users {
						if userInfo.SeatIndex == i {
							userInfo.ConversionScore, err = strconv.ParseFloat(fmt.Sprintf("%.3f", float64(userInfo.Score)/1000), 64)
							if err != nil {
								logs.Error("ParseFloat [%v] err %v", userInfo.Score, err)
							}
							roomUsers = append(roomUsers, userInfo)
							seatHasPlayer = true
						}
					}
					if !seatHasPlayer {
						roomUsers = append(roomUsers, &UserInfo{
							SeatIndex: i,
						})
					}
				}
				client.sendToClient([]interface{}{
					"game_sync_push",
					map[string]interface{}{
						"roomBaseScore": client.Room.Conf.BaseScore,
						"seats":         roomUsers,
					},
				})
			} else {
				logs.Error("user req ready json unmarshal err : %v", err)
			}
		case "user_fire":
			if len(reqJson) < 2 {
				return
			}
			// Parse as generic map first to handle type mismatches
			bulletData := make(map[string]interface{})
			if err := json.Unmarshal([]byte(reqJson[1]), &bulletData); err == nil {
				bullet := Bullet{}
				
				// Handle userId (can be string or number)
				if userIdVal, ok := bulletData["userId"]; ok {
					if userIdStr, ok := userIdVal.(string); ok {
						// Convert string userId to numeric UserId
						if len(userIdStr) > 6 && userIdStr[:6] == "guest_" {
							if userIdInt, err := strconv.ParseInt(userIdStr[6:], 10, 64); err == nil {
								bullet.UserId = UserId(userIdInt)
							} else {
								bullet.UserId = client.UserInfo.UserId // fallback to client's userId
							}
						} else {
							bullet.UserId = client.UserInfo.UserId // fallback to client's userId
						}
					} else if userIdFloat, ok := userIdVal.(float64); ok {
						bullet.UserId = UserId(userIdFloat)
					} else {
						bullet.UserId = client.UserInfo.UserId // fallback to client's userId
					}
				} else {
					bullet.UserId = client.UserInfo.UserId // fallback to client's userId
				}
				
				// Handle other fields
				if chairId, ok := bulletData["chairId"].(float64); ok {
					bullet.ChairId = int(chairId)
				}
				if bulletKind, ok := bulletData["bulletKind"].(float64); ok {
					bullet.BulletKind = int(bulletKind)
				}
				if bulletId, ok := bulletData["bulletId"].(string); ok {
					bullet.BulletId = BulletId(bulletId)
				}
				if angle, ok := bulletData["angle"].(float64); ok {
					bullet.Angle = angle
				}
				if sign, ok := bulletData["sign"].(string); ok {
					bullet.Sign = sign
				}
				if lockFishId, ok := bulletData["lockFishId"].(float64); ok {
					bullet.LockFishId = FishId(lockFishId)
				}
				
				logs.Debug("User %d firing bullet kind %d", bullet.UserId, bullet.BulletKind)
				client.Fire(&bullet)
			} else {
				logs.Error("user fire json parse err: %v", err)
			}
		case "laser_catch_fish":
			if len(reqJson) < 2 {
				return
			}
			// Parse as generic map to handle userId type mismatch
			laserCatchData := make(map[string]interface{})
			if err := json.Unmarshal([]byte(reqJson[1]), &laserCatchData); err == nil {
				var fishes string
				if fishesVal, ok := laserCatchData["fishes"]; ok {
					if fishesStr, ok := fishesVal.(string); ok {
						fishes = fishesStr
					}
				}
				fishIdStrArr := strings.Split(fishes, "-")
				if len(fishIdStrArr) == 0 {
					logs.Debug("user [%v] laser_catch_fish catch zero fish...")
				}
				killedFishes := make([]string, 0)
				addScore := 0
				for _, fishStr := range fishIdStrArr {
					if fishIdInt, err := strconv.Atoi(fishStr); err == nil {
						fishId := FishId(fishIdInt)
						if fish, ok := client.Room.AliveFish[fishId]; ok {
							killedFishes = append(killedFishes, strconv.Itoa(int(fish.FishId)))
							//加钱
							addScore += GetFishMulti(fish) * GetBulletMulti(BulletKind["bullet_kind_laser"]) * client.Room.Conf.BaseScore
						} else {
							logs.Debug("user [%v] laser_catch_fish fishId [%v] not in alive fish array...", client.UserInfo.UserId, fishId)
						}
					} else {
						logs.Error("laser_catch_fish err : fishId [%v] err", fishStr)
					}
				}
				//if addScore > client.Room.Conf.BaseScore*200 { //最大200倍
				//	addScore = client.Room.Conf.BaseScore * 200
				//}
				client.UserInfo.Score += addScore
				client.UserInfo.Bill += addScore //记账
				catchFishAddScore, _ := strconv.ParseFloat(fmt.Sprintf("%.5f", float64(addScore)/1000), 64)
				client.Room.broadcast([]interface{}{
					"catch_fish_reply",
					map[string]interface{}{
						"userId":   client.UserInfo.UserId,
						"chairId":  client.UserInfo.SeatIndex + 1,
						"fishId":   strings.Join(killedFishes, ","),
						"addScore": catchFishAddScore,
						"isLaser":  true,
					},
				})
			} else {
				logs.Error("laser_catch_fish err : %v", err)
			}
		case "user_lock_fish":
			if len(reqJson) < 2 {
				return
			}
			// Parse as generic map to handle userId type mismatch
			lockFishData := make(map[string]interface{})
			if err := json.Unmarshal([]byte(reqJson[1]), &lockFishData); err == nil {
				// Create response with correct types
				response := map[string]interface{}{
					"userId":  client.UserInfo.UserId,
					"chairId": client.UserInfo.SeatIndex + 1,
				}
				if fishIdVal, ok := lockFishData["fishId"]; ok {
					response["fishId"] = fishIdVal
				}
				
				client.sendToOthers([]interface{}{
					"lock_fish_reply",
					response,
				})
				logs.Debug("User %d locked fish", client.UserInfo.UserId)
			} else {
				logs.Error("user_lock_fish json parse err: %v", err)
			}
		case "user_frozen":
			if len(reqJson) < 2 {
				return
			}
			client.frozenScene(time.Now())
		case "user_change_cannon":
			if len(reqJson) < 2 {
				return
			}
			// Parse as generic map to handle mixed types
			changeCannonData := make(map[string]interface{})
			if err := json.Unmarshal([]byte(reqJson[1]), &changeCannonData); err == nil {
				var cannonKind int
				if cannonKindVal, ok := changeCannonData["cannonKind"]; ok {
					if cannonKindFloat, ok := cannonKindVal.(float64); ok {
						cannonKind = int(cannonKindFloat)
					} else if cannonKindInt, ok := cannonKindVal.(int); ok {
						cannonKind = cannonKindInt
					} else {
						logs.Error("Invalid cannonKind type: %T", cannonKindVal)
						return
					}
				} else {
					logs.Error("cannonKind not found in request")
					return
				}
				
				if cannonKind < 1 {
					return
				}
				if cannonKind == BulletKind["bullet_kind_laser"] {
					if client.UserInfo.Power < 1 {
						return
					}
				}
				client.UserInfo.CannonKind = cannonKind
				
				// Create response with correct types
				response := map[string]interface{}{
					"userId":     client.UserInfo.UserId,
					"chairId":    client.UserInfo.SeatIndex + 1, // chairId = seatIndex + 1
					"cannonKind": cannonKind,
				}
				
				// Send to others only (client updates locally)
				client.sendToOthers([]interface{}{
					"user_change_cannon_reply",
					response,
				})
				logs.Debug("User %d changed cannon to kind %d", client.UserInfo.UserId, cannonKind)
			} else {
				logs.Error("user_change_cannon json parse err: %v", err)
			}
		case "exit":
			client.sendToOthers([]interface{}{
				"exit_notify_push",
				client.UserInfo.UserId,
			})
			jsonByte, err := json.Marshal([]string{"exit_result"})
			if err != nil {
				logs.Error("game ping json marshal err,%v", err)
				return
			}
			client.sendMsg(append([]byte{'4', '2'}, jsonByte...))
			client.sendMsg([]byte{'4', '1'})
			clientExit(client, false)

		case "dispress":
		case "disconnect":
		case "game_ping":
			jsonByte, err := json.Marshal([]string{"game_pong"})
			if err != nil {
				logs.Error("game ping json marshal err,%v", err)
				return
			}
			client.sendMsg(append([]byte{'4', '2'}, jsonByte...))
		case "client_exit":
			if client.UserInfo.Online {
				clientExit(client, true)
			}
		}
	}
}

func clientExit(client *Client, closeClient bool) {
	logs.Debug("user %v exit close client: %v ...", client.UserInfo.UserId, closeClient)
	if client.UserInfo.Bill != 0 {
		client.clearBill()
	}
	RoomMgr.RoomLock.Lock()
	logs.Info("clientExit get lock...")
	defer RoomMgr.RoomLock.Unlock()
	defer logs.Info("clientExit set free lock...")
	client.UserInfo.Online = false
	roomUserIdArr := make([]UserId, 0)
	if roomInfo, ok := RoomMgr.RoomsInfo[client.Room.RoomId]; ok {
		for _, roomUserId := range roomInfo.UserInfo {
			if roomUserId != client.UserInfo.UserId {
				roomUserIdArr = append(roomUserIdArr, roomUserId)
			}
		}
		roomInfo.UserInfo = roomUserIdArr
		delete(client.Room.Users, client.UserInfo.UserId)
		if closeClient {
			client.closeChan <- true
			close(client.closeChan) //关闭channel不影响取出关闭前传送的数据，继续取将得到零值  :-)
		}
		if len(client.Room.Users) == 0 { //房间无人，消除房间
			delete(RoomMgr.RoomsInfo, client.Room.RoomId)
			delete(RoomMgr.Rooms, client.Room.RoomId)
			logs.Debug("room %v is empty now ...", client.Room.RoomId)
			client.Room.Exit <- true
			logs.Debug("send exit sign succ ...")
		}
		//close(client.msgChan)
	} else {
		logs.Error("exit client not in room...")
	}
}
