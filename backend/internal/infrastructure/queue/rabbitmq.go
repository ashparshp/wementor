package queue

import (
	"context"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type RabbitMQ struct {
	Conn    *amqp.Connection
	Channel *amqp.Channel
}

// Connect establishes a connection to RabbitMQ.
func Connect(url string) (*RabbitMQ, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open a channel: %w", err)
	}

	return &RabbitMQ{
		Conn:    conn,
		Channel: ch,
	}, nil
}

// Close closes the RabbitMQ connection and channel.
func (r *RabbitMQ) Close() {
	if r.Channel != nil {
		r.Channel.Close()
	}
	if r.Conn != nil {
		r.Conn.Close()
	}
}

// DeclareExchange creates an exchange.
func (r *RabbitMQ) DeclareExchange(name, kind string) error {
	return r.Channel.ExchangeDeclare(
		name,
		kind,
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,   // arguments
	)
}

// DeclareQueue creates a queue and binds it to the exchange.
func (r *RabbitMQ) DeclareQueue(name, exchange, routingKey string) (amqp.Queue, error) {
	q, err := r.Channel.QueueDeclare(
		name,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return q, fmt.Errorf("failed to declare queue: %w", err)
	}

	err = r.Channel.QueueBind(
		q.Name,
		routingKey,
		exchange,
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return q, fmt.Errorf("failed to bind queue: %w", err)
	}

	return q, nil
}

// Publish publishes a message to the exchange.
func (r *RabbitMQ) Publish(ctx context.Context, exchange, routingKey string, body []byte) error {
	return r.Channel.PublishWithContext(ctx,
		exchange,
		routingKey,
		false, // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
}

// Consume starts a consumer that calls the handler for each message.
func (r *RabbitMQ) Consume(queueName string, handler func(msg amqp.Delivery), logger *zap.Logger) error {
	msgs, err := r.Channel.Consume(
		queueName,
		"",    // consumer
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("failed to register a consumer: %w", err)
	}

	go func() {
		for d := range msgs {
			handler(d)
			// Acknowledge the message after successful processing
			if err := d.Ack(false); err != nil {
				logger.Error("Failed to acknowledge message", zap.Error(err))
			}
		}
	}()

	return nil
}
