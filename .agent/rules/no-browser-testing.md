# Regra de Testes no Navegador

1. **NUNCA abra o navegador automaticamente para testes (proibido o uso de `browser_subagent` ou `open_browser_url`).**
2. **Sempre que for necessária qualquer validação visual, verificação de telas ou testes de interface/fluxo de usuário, PEÇA ao usuário (Fulvio) para testar diretamente no navegador dele.**
3. **Mantenha os testes automatizados estritamente restritos a comandos de terminal como `npm run build` ou testes unitários.**
