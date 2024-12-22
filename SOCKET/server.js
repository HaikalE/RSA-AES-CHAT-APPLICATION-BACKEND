const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Sesuaikan sesuai kebutuhan
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: Socket ID = ${socket.id}`);

     // Setup user saat user terhubung menggunakan userId
     socket.on('setup', (chatData) => {
        const { userId, chatId } = chatData; // Ambil userId dan chatId

        if (userId) {
            socket.join(userId); // Gabungkan ke room userId
            console.log(`User joined personal room: User ID = ${userId} | Socket ID = ${socket.id}`);
        } else {
            console.error(`Setup Error: userId not provided | Socket ID = ${socket.id}`);
        }

        if (chatId) {
            socket.join(chatId); // Gabungkan ke room chatId jika ada
            console.log(`User joined chat room: Chat ID = ${chatId} | Socket ID = ${socket.id}`);
        }
    });

    // Terima pesan dari client dan kirim ke semua user di room terkait
    socket.on('sendMessage', (messageData) => {
        console.log("Data diterima dari client:", messageData);  // Log seluruh data yang diterima
        
        const { chatId, content, encryptedAesKey, senderId } = messageData;  // Ambil langsung senderId
    
        // Debug rincian setiap field
        console.log("chatId:", chatId || "chatId tidak ada");
        console.log("content:", content || "content tidak ada");
        console.log("encryptedAesKey:", encryptedAesKey || "encryptedAesKey tidak ada");
        console.log("senderId:", senderId || "senderId tidak ada");
      
        if (chatId && senderId && content) {
            // Kirim pesan ke semua user di room chatId
            io.to(chatId).emit('message', {
                chatId: chatId,
                sender: { _id: senderId },
                content: content,
                encryptedAesKey: encryptedAesKey,
                createdAt: new Date(),
                updatedAt: new Date()
            });
    
            // Kirim pesan juga ke user dengan userId senderId
            io.to(senderId).emit('message', {
                chatId: chatId,
                sender: { _id: senderId },
                content: content,
                encryptedAesKey: encryptedAesKey,
                createdAt: new Date(),
                updatedAt: new Date()
            });
    
            console.log(`Message sent to chatId ${chatId} and to senderId ${senderId}: ${content}`);
        } else {
            // Debug pesan error yang lebih rinci
            console.error(`Message Error: chatId, senderId, atau content tidak ada.`);
            console.error(`Detail error: {
                chatId: ${chatId ? chatId : "MISSING"},
                senderId: ${senderId ? senderId : "MISSING"},
                content: ${content ? content : "MISSING"},
                socketId: ${socket.id}
            }`);
        }
    });
    
    

    

    // Terima event typing dari client dan broadcast ke semua user
    socket.on('toggleTyping', (typingData) => {
        const { chatId, user } = typingData;
        if (chatId && user) {
            io.to(chatId).emit('isTyping', {
                chatId: chatId,
                user: user,
                typing: true
            });
            console.log(`CHATID ${chatId} Typing status broadcasted to all: Chat ID = ${chatId} | User = ${JSON.stringify(user)} | Socket ID = ${socket.id}`);
        } else {
            console.error(`Typing Error: chatId or user data missing in typingData | Socket ID = ${socket.id}`);
        }
    });

    // Debug tambahan untuk disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: Socket ID = ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
