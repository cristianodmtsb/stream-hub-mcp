#!/usr/bin/env node
import { Command } from 'commander';
import { runSetupWizard } from '../cli/setup.js';
import { runAuthCommand } from '../cli/auth.js';
import { ConfigManager } from '../core/config.js';

const program = new Command();

program
  .name('stream-hub')
  .description('StreamHub CLI: Ferramenta de configuração e autenticação para o servidor MCP de live streaming')
  .version('0.1.0');

program
  .command('setup')
  .description('Executa o assistente de configuração inicial e cria os diretórios em ~/.stream-hub')
  .action(async () => {
    await runSetupWizard();
  });

program
  .command('auth <platform>')
  .description('Inicia o fluxo de autorização OAuth local para uma plataforma (youtube, twitch, kick)')
  .action(async (platform: string) => {
    await runAuthCommand(platform);
  });

program
  .command('status')
  .description('Exibe o status de configuração das plataformas instaladas')
  .action(async () => {
    const configManager = new ConfigManager();
    const config = await configManager.getFullConfig();
    const tokens = await configManager.getAllTokens();

    console.log('\n📊 Status do StreamHub:');
    console.log(`Diretório base: ${configManager.getBaseDir()}`);
    console.log('\nPlataformas:');

    const platforms = ['youtube', 'twitch', 'kick'];
    for (const p of platforms) {
      const hasConfig = Boolean(config.platforms[p]);
      const hasToken = Boolean(tokens[p]?.accessToken);
      const icon = hasToken ? '🟢 Autenticado' : (hasConfig ? '🟡 Credenciais salvas (aguardando auth)' : '⚪ Não configurado');
      console.log(`- ${p.toUpperCase().padEnd(8)}: ${icon}`);
    }
    console.log('\n');
  });

program.parse(process.argv);
