# Deployment Guide

This guide covers different deployment options for the Biodiversity Dashboard.

## Local Development

### Quick Start
```bash
# 1. Clone the repository
git clone <repository-url>
cd biodiversity-dashboard

# 2. Set up Python environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate sample data
python scripts/download_data.py

# 5. Start the backend
python backend/main.py

# 6. In another terminal, start the frontend
cd frontend
npm install
npm start
```

### Using the Startup Script
```bash
python start_app.py
```

## Docker Deployment

### Build and Run with Docker
```bash
# Build the image
docker build -t biodiversity-dashboard .

# Run the container
docker run -p 8000:8000 biodiversity-dashboard
```

### Using Docker Compose
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Cloud Deployment

### Heroku
1. Create a `Procfile`:
```
web: python backend/main.py
```

2. Deploy:
```bash
heroku create biodiversity-dashboard
git push heroku main
```

### AWS EC2
1. Launch an EC2 instance (t2.micro or larger)
2. Install Docker and Docker Compose
3. Clone the repository
4. Run with Docker Compose

### Google Cloud Run
1. Build and push to Google Container Registry
2. Deploy to Cloud Run
3. Set environment variables

### Azure Container Instances
1. Build and push to Azure Container Registry
2. Deploy to Container Instances

## Environment Variables

Create a `.env` file in the backend directory:

```env
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Production Considerations

### Backend
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up proper logging
- Configure CORS for your domain
- Use environment variables for configuration
- Set up monitoring and health checks

### Frontend
- Build for production: `npm run build`
- Serve static files with a CDN
- Configure API URL for production
- Set up proper caching headers

### Database
- For production, consider using a proper database (PostgreSQL, MongoDB)
- Set up database migrations
- Configure connection pooling

### Security
- Use HTTPS in production
- Set up proper authentication if needed
- Configure rate limiting
- Validate all inputs

## Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: Check if the app loads correctly

### Logging
- Backend logs are configured in `backend/main.py`
- Frontend logs in browser console

### Performance
- Monitor API response times
- Check memory usage
- Monitor database queries

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in the configuration
   - Kill the process using the port

2. **CORS errors**
   - Check CORS_ORIGINS configuration
   - Ensure frontend URL is included

3. **Data not loading**
   - Check if data files exist in `data/` directory
   - Verify file permissions

4. **Frontend not connecting to backend**
   - Check API URL configuration
   - Verify backend is running
   - Check network connectivity

### Logs
- Backend logs: Check console output
- Frontend logs: Check browser developer tools
- Docker logs: `docker-compose logs`

## Scaling

### Horizontal Scaling
- Use a load balancer
- Deploy multiple backend instances
- Use a shared database

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use caching (Redis)

## Backup and Recovery

### Data Backup
- Regular backups of data files
- Database backups if using a database
- Configuration backups

### Recovery
- Restore from backups
- Rebuild from source code
- Use infrastructure as code

## Maintenance

### Updates
- Update dependencies regularly
- Test updates in staging environment
- Use blue-green deployment

### Monitoring
- Set up alerts for errors
- Monitor performance metrics
- Regular health checks

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs
3. Check the GitHub issues
4. Contact the development team
