package com.example.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRequisitionStatusEmail(
            String email,
            Integer requisitionId,
            String status) {

        System.out.println("====================================");
        System.out.println("EMAIL SERVICE CALLED");
        System.out.println("Recipient: " + email);
        System.out.println("Requisition ID: " + requisitionId);
        System.out.println("Status: " + status);
        System.out.println("====================================");

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("Requisition Status Update");

        String body = "Hello,\n\n"
                + "Your requisition has been updated.\n\n"
                + "Requisition ID: " + requisitionId + "\n"
                + "Status: " + status + "\n\n"
                + "Regards,\n"
                + "Smart Procurement System";

        message.setText(body);

        System.out.println("Sending email...");

        mailSender.send(message);

        System.out.println("EMAIL SENT SUCCESSFULLY");
    }
}