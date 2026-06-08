@echo off
cd /d "C:\Users\miros\Downloads\Projekty\settleradar"
echo Uruchamianie synchronizacji bazy danych z Postgres...
call npm run sync-db

echo Zapisywanie zmian do Git...
git add src/data/database.json
git commit -m "chore: automatyczna synchronizacja danych"
git push

echo Synchronizacja zakonczona sukcesem! Vercel wlasnie rozpoczal budowanie.
