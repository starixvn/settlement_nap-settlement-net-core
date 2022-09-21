@ECHO OFF

SET SourceFolder=%1

cd %SourceFolder%

cmd /c "npm -v & npm install & jest --ci

exit 0