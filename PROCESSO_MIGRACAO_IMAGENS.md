# Processo de Migração para Armazenamento em Nuvem (Imagens)

## Objetivo
Orientar a equipe sobre como migrar o armazenamento de imagens do modo local para um provider em nuvem (ex: AWS S3, Google Cloud Storage).

## Passos Gerais

1. **Escolha do Provider**
   - Defina o serviço de nuvem a ser utilizado (ex: S3, GCS).

2. **Configuração de Credenciais**
   - Adicione as variáveis de ambiente necessárias no `.env` (exemplo para S3):
     - `IMAGE_STORAGE_PROVIDER=s3`
     - `S3_BUCKET=nome-do-bucket`
     - `S3_ACCESS_KEY=...`
     - `S3_SECRET_KEY=...`
     - `S3_REGION=...`
   - Para o modo **local**, você pode configurar o caminho:
     - `LOCAL_IMAGES_PATH=./briefs` (caminho relativo à raiz do backend)

3. **Implementação Backend**
   - Adapte a configuração do multer para usar o storage do provider (ex: `multer-s3`).
   - No upload, salve o arquivo diretamente no bucket e armazene a URL pública no banco.
   - Mantenha compatibilidade com o modo local para ambientes de desenvolvimento.

4. **Migração dos Arquivos Existentes**
   - Faça upload dos arquivos da pasta local (`backend/briefs/<templateId>/images`) para o bucket.
   - Atualize os links no banco, se necessário.

5. **Testes e Validação**
   - Teste uploads, listagem e acesso às imagens em produção.
   - Garanta que as permissões do bucket estejam corretas (público/privado conforme necessidade).

## Observações
- O backend já está preparado para alternar entre local e nuvem via `IMAGE_STORAGE_PROVIDER`.
- Recomenda-se versionar scripts de migração e documentar credenciais de forma segura.

---

> Para dúvidas ou exemplos de código, consulte a documentação do provider escolhido ou peça exemplos ao time técnico.
