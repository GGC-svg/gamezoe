/**
 * RoomManager.js
 * Dynamic room management system aligned with Go architecture
 * Handles room creation, matchmaking, lifecycle, and spawn timers
 */

export class RoomManager {
    constructor(ioInstances, outputTraceConfig, FishMulti) {
        this.rooms = new Map();  // roomId -> room object
        this.nextRoomId = 1000;   // Start from 1000 like Go
        this.roomSpawnTimers = new Map();  // roomId -> [timer1, timer2, ...]
        this.ioInstances = ioInstances;
        this.outputTraceConfig = outputTraceConfig;
        this.FishMulti = FishMulti;
        this.nextFishId = 1000;  // Global fish ID counter
    }

    /**
     * Find an available room with matching baseScore, or create a new one
     * Implements Go's matchmaking logic from enter_public_room.go
     */
    findOrCreateRoom(baseScore) {
        // Step 1: Find existing room with space
        for (const [roomId, room] of this.rooms) {
            if (room.baseScore === baseScore &&
                Object.keys(room.users).length < 4) {
                console.log(`[ROOM] Matched user to existing room ${roomId} (${Object.keys(room.users).length}/4 players)`);
                return roomId;
            }
        }

        // Step 2: No available room found, create new one
        return this.createRoom(baseScore);
    }

    /**
     * Create a new room instance
     */
    createRoom(baseScore) {
        const roomId = this.nextRoomId++;

        this.rooms.set(roomId, {
            roomId,
            baseScore,
            aliveFish: {},
            aliveBullets: {},
            users: {},
            createdAt: Date.now()
        });

        // Start spawn timers for this room
        this.startRoomSpawnTimers(roomId);

        console.log(`[ROOM] Created room ${roomId} (baseScore: ${baseScore})`);
        return roomId;
    }

    /**
     * Get room by ID
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    /**
     * Delete a room and cleanup resources
     */
    deleteRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Stop all spawn timers
        this.stopRoomSpawnTimers(roomId);

        // Remove from map
        this.rooms.delete(roomId);

        console.log(`[ROOM] Deleted room ${roomId} (was baseScore: ${room.baseScore})`);
    }

    /**
     * Check if room is empty and schedule deletion
     */
    checkAndDeleteEmptyRoom(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        const userCount = Object.keys(room.users).length;
        if (userCount === 0) {
            // Grace period: wait 60s before deleting
            console.log(`[ROOM] Room ${roomId} is empty, scheduling deletion in 60s...`);
            setTimeout(() => {
                const stillExists = this.getRoom(roomId);
                if (stillExists && Object.keys(stillExists.users).length === 0) {
                    this.deleteRoom(roomId);
                }
            }, 60000);
        }
    }

    /**
     * Start spawn timers for a room (aligned with Go's room.begin())
     */
    startRoomSpawnTimers(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        // Prevent duplicate timers
        if (this.roomSpawnTimers.has(roomId)) {
            console.log(`[ROOM] Room ${roomId} already has active spawn timers`);
            return;
        }

        const timers = [];

        // Cleanup timer: Remove expired fish every 10s
        const tCleanup = setInterval(() => {
            const now = Date.now();
            const lifetime = 120000; // 120s like Go
            let count = 0;

            if (room.aliveFish) {
                Object.keys(room.aliveFish).forEach(fId => {
                    const fish = room.aliveFish[fId];
                    if (fish && (now - fish.activeTime > lifetime)) {
                        delete room.aliveFish[fId];
                        count++;
                    }
                });
            }

            if (count > 0) {
                console.log(`[CLEANUP] Room ${roomId} removed ${count} expired fish`);
            }
        }, 10000);

        // Timer 1: Small fish (1-15) every 2s
        const t1 = setInterval(() => {
            if (Object.keys(room.users).length === 0) return;
            this.spawnFishBatch(roomId, 1, 15, 1);
        }, 2000);

        // Timer 2: Medium fish (16-20) every 10.1s
        const t2 = setInterval(() => {
            if (Object.keys(room.users).length === 0) return;
            this.spawnFishBatch(roomId, 16, 20, 2);
        }, 10100);

        // Timer 3: Large fish (21-34) every 30.2s
        const t3 = setInterval(() => {
            if (Object.keys(room.users).length === 0) return;
            this.spawnFishBatch(roomId, 21, 34, 3);
        }, 30200);

        // Timer 4: Boss fish (35) every 61s
        const t4 = setInterval(() => {
            if (Object.keys(room.users).length === 0) return;
            this.spawnFishBatch(roomId, 35, 35, 4);
        }, 61000);

        timers.push(tCleanup, t1, t2, t3, t4);
        this.roomSpawnTimers.set(roomId, timers);

        console.log(`[ROOM] Started ${timers.length} spawn timers for room ${roomId}`);
    }

    /**
     * Stop all spawn timers for a room
     */
    stopRoomSpawnTimers(roomId) {
        const timers = this.roomSpawnTimers.get(roomId);
        if (timers) {
            timers.forEach(clearInterval);
            this.roomSpawnTimers.delete(roomId);
            console.log(`[ROOM] Stopped spawn timers for room ${roomId}`);
        }
    }

    /**
     * Spawn fish batch for a specific room
     */
    spawnFishBatch(roomId, kindStart, kindEnd, intervalType) {
        if (!this.outputTraceConfig) return;

        const room = this.getRoom(roomId);
        if (!room) return;

        // [FROZEN] Check if room is frozen
        if (room.frozenEndTime && Date.now() < room.frozenEndTime) {
            // console.log(`[SPAWN] Room ${roomId} is frozen. Pausing spawn.`);
            return;
        }

        const fishKind = Math.floor(Math.random() * (kindEnd - kindStart + 1)) + kindStart;

        // Random trace selection
        let traceId = (intervalType === 4)
            ? (101 + Math.floor(Math.random() * 10))
            : (Math.floor(Math.random() * 3) === 0
                ? 201 + Math.floor(Math.random() * 17)
                : 101 + Math.floor(Math.random() * 10));

        const paths = this.outputTraceConfig[String(traceId)];
        if (!paths || paths.length === 0) return;

        const fishList = [];
        const addFish = (pathData) => {
            this.nextFishId++;
            const fId = this.nextFishId;
            const speed = (fishKind >= 30) ? 3 : 5;

            room.aliveFish[fId] = {
                fishId: fId,
                fishKind,
                trace: pathData,
                speed,
                activeTime: Date.now()
            };

            fishList.push({
                fishId: fId,
                fishKind,
                trace: pathData,
                speed,
                activeTime: Date.now()
            });
        };

        if (intervalType === 1) {
            paths.forEach(p => addFish(p));
        } else {
            addFish(paths[0]);
        }

        // Broadcast to room channel
        if (fishList.length > 0 && this.ioInstances) {
            const roomIdStr = String(roomId);
            let sentCount = 0;
            this.ioInstances.forEach(serverIO => {
                const socketsMap = serverIO.sockets.sockets;
                if (socketsMap) {
                    socketsMap.forEach((socket) => {
                        if (String(socket.currentRoomId) === roomIdStr) {
                            socket.emit('build_fish_reply', fishList);
                            sentCount++;
                        }
                    });
                }
            });
            // Old loop effectively removed by not including it in replacement but commenting out original lines
            /*
            const roomName = `room_${roomId}`;
            this.ioInstances.forEach(serverIO => {
            */
            // [CLEANUP] Removed old broadcast code
            console.log(`[SPAWN] Room ${roomId} DIRECTLY broadcasted ${fishList.length} fish (Type ${intervalType})`);
        }
    }

    /**
     * Get all rooms for debugging
     */
    getAllRooms() {
        const summary = [];
        for (const [roomId, room] of this.rooms) {
            summary.push({
                roomId,
                baseScore: room.baseScore,
                userCount: Object.keys(room.users).length,
                fishCount: Object.keys(room.aliveFish).length,
                bulletCount: Object.keys(room.aliveBullets).length
            });
        }
        return summary;
    }
}

// Helper function to convert baseParam to baseScore
export function baseParamToScore(baseParam) {
    const num = parseInt(baseParam) || 1;
    if (num === 1) return 0.001;
    if (num === 50) return 0.05;
    if (num === 500) return 0.5;
    if (num === 2000) return 2.0;
    return 0.001; // default
}
