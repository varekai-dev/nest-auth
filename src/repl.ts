import { repl } from '@nestjs/core';
import { AppModule } from 'app.module';

async function bootstrap() {
  await repl(AppModule);
}

bootstrap();

//example update DB

// await get("UserRepository").update({id:1}, {role:'regular'})
