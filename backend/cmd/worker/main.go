package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"wementor-backend/internal/config"
	"wementor-backend/internal/infrastructure/queue"
	"wementor-backend/pkg/logger"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// Initialize logger
	l := logger.New(cfg.Env)
	defer l.Sync()

	// Connect to RabbitMQ
	rmq, err := queue.Connect(cfg.RabbitMQURL)
	if err != nil {
		l.Fatal("failed to connect to RabbitMQ", zap.Error(err))
	}
	defer rmq.Close()
	l.Info("connected to RabbitMQ successfully")

	// Setup exchanges and queues
	exchangeName := "wementor.events"
	queueName := "wementor.events.queue"
	
	err = rmq.DeclareExchange(exchangeName, "topic")
	if err != nil {
		l.Fatal("failed to declare exchange", zap.Error(err))
	}

	// For now, let's bind to all events using "#"
	_, err = rmq.DeclareQueue(queueName, exchangeName, "#")
	if err != nil {
		l.Fatal("failed to declare and bind queue", zap.Error(err))
	}

	// Start consuming messages
	err = rmq.Consume(queueName, handleMessage(l), l)
	if err != nil {
		l.Fatal("failed to start consuming", zap.Error(err))
	}

	l.Info("Worker started successfully. Waiting for messages...")

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	l.Info("Worker is shutting down...")
}

func handleMessage(l *zap.Logger) func(msg amqp.Delivery) {
	return func(msg amqp.Delivery) {
		l.Info("Received message",
			zap.String("routing_key", msg.RoutingKey),
			zap.ByteString("body", msg.Body),
		)
		
		// Here we would route to specific handlers based on the routing key
		// e.g., if msg.RoutingKey == "payment.captured" -> handlePaymentCaptured(msg.Body)
	}
}
