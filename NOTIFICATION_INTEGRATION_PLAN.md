# Notification Integration Points

## 1. Individual Worker Job Flow (jobs/views.py)

### Line ~805: Worker verifies arrival (status → IN_PROGRESS)
- ✅ ADD: notification_manager.send_job_started_notification(client_user, work_request)

### Line ~1007: Worker verifies OTP (status → IN_PROGRESS) 
- ✅ ADD: notification_manager.send_job_started_notification(client_user, work_request)

## 2. Organization Worker Job Flow (organization/views.py)

### Accept job endpoint (search for "accept" in org views)
- ✅ ADD: notification_manager.send_job_accepted_notification(client_user, work_request, worker_name)
- ✅ ADD: notification_manager.send_new_job_request_notification(worker_user, work_request) when job is created

### Reject job endpoint (line ~548: status = 'rejected')
- ✅ ADD: notification_manager.send_job_rejected_notification(client_user, work_request, worker_name, reason)

### Complete job endpoint
- ✅ ADD: notification_manager.send_job_completed_notification([client_user, worker_user], work_request)

### Cancel job endpoint
- ✅ ADD: notification_manager.send_job_cancelled_notification(recipient, work_request, cancelled_by, reason)

## 3. Authentication (authentication/views.py or similar)

### Signup endpoint
- ✅ ADD: notification_manager.send_welcome_notification(user, user_type)

### Login endpoint (optional)
- ✅ ADD: notification_manager.send_login_notification(user, device_info)

## Need to find these endpoints first!
