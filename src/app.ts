import express, { Application, Request, Response } from 'express';
import dotenvFlow from 'dotenv-flow';
import {connect, testConnection} from './repository/database';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { disconnect } from './repository/database';
import { setupDocumentation } from './util/documentation';

dotenvFlow.config();    
const app: Application = express();

/**
 * Starts the Express server.
 * This function sets up middleware, routes, and starts listening on the specified port.
 */
export function startServer() {

    app.use(cors({

    // Allow request from any origin
    origin: "*",

    // allow HTTP methods
    methods: ["GET", "PUT", "POST", "DELETE"],

    // allow headers
    allowedHeaders: ['auth-token', 'Origin', 'X-Requested-Width', 'Content-Type', 'Accept'],

    // allow credentials
    credentials:true
    }))

    app.use(express.json());
    
    app.use('/api', routes);

    setupDocumentation(app);

    testConnection();

    // Serve Angular frontend
  const frontendPath = path.join(__dirname, '../frontend/dist/frontend');
  app.use(express.static(frontendPath));

  // Serve index.html for all non-API routes (Angular routing)
app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


    const PORT:number = parseInt(process.env.PORT as string) || 4000;
    app.listen(PORT, function() {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Only start server if this file is executed directly
if (require.main === module) {
  startServer();
}