const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { errorHandler } = require('../middleware/errorHandler.cjs');
const { createAuthRoutes } = require('../routes/auth.cjs');
const { createUsersRoutes } = require('../routes/users.cjs');
const { createProfileRoutes } = require('../routes/profile.cjs');
const { createBrandingRoutes } = require('../routes/branding.cjs');
const { createSettingsRoutes } = require('../routes/settings.cjs');
const { createAiRoutes } = require('../routes/ai.cjs');
const { createDocumentsRoutes } = require('../routes/documents.cjs');
const { createTagsRoutes } = require('../routes/tags.cjs');
const { createNotesRoutes } = require('../routes/notes.cjs');
const { createSharedRoutes } = require('../routes/shared.cjs');
const { createShareRoutes } = require('../routes/shares.cjs');

function createApp(context) {
  const app = express();
  const routeContext = {
    authMiddleware: context.authMiddleware,
    authService: context.services.auth,
    brandingService: context.services.branding,
    config: context.config,
    documentsService: context.services.documents,
    notesHistoryService: context.services.notesHistory,
    openRouterService: context.services.openRouter,
    profileService: context.services.profile,
    settingsService: context.services.settings,
    sharedService: context.services.shared,
    tagsService: context.services.tags,
    uploadMiddleware: context.uploadMiddleware,
    usersService: context.services.users,
  };

  app.set('trust proxy', context.config.trustProxy);
  app.use(express.json());
  app.use(cookieParser(context.config.cookieSecret));

  app.use(createAuthRoutes(routeContext));
  app.use(createUsersRoutes(routeContext));
  app.use(createProfileRoutes(routeContext));
  app.use(createBrandingRoutes(routeContext));
  app.use(createSettingsRoutes(routeContext));
  app.use(createAiRoutes(routeContext));
  app.use(createDocumentsRoutes(routeContext));
  app.use(createTagsRoutes(routeContext));
  app.use(createNotesRoutes(routeContext));
  app.use(createShareRoutes(routeContext));
  app.use(createSharedRoutes(routeContext));

  if (fs.existsSync(context.config.distDir)) {
    app.use(express.static(context.config.distDir));
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api')) {
        return res.sendFile(path.join(context.config.distDir, 'index.html'));
      }
      next();
    });
  }

  app.use(errorHandler);
  return app;
}

module.exports = {
  createApp,
};
