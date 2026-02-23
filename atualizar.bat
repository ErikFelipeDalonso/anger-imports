@echo off
echo Enviando atualizacoes...
git add .
set /p msg="Mensagem do commit: "
git commit -m "%msg%"
git push
echo Pronto! Site atualizado.
pause
