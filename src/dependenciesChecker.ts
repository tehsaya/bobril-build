import * as fs from 'fs';
import * as path from "path"
import * as bb from './index';
import * as pathUtils from "./pathUtils"
import * as processUtils from "./processUtils"
import * as commander from 'commander';

class DependenciesChecker {
    missingModules: string[] = [];
    project: bb.IProject;
    constructor(project: bb.IProject) {
        this.project = project;
    }

    private getModulePath(): string {
        return path.join(this.project.dir, "node_modules");
    }

    private findMissingModulesFromList(dependencies: string[]) {
        for (let i = 0; i < dependencies.length; i++) {
            var moduleName = dependencies[i];
            var moduleDir = path.join(this.getModulePath(), moduleName);
            if (!fs.existsSync(moduleDir)) {
                this.missingModules.push(moduleName);
            }
        }
    }

    private findMissingModules() {
        this.findMissingModulesFromList(this.project.dependencies);
        this.findMissingModulesFromList(this.project.devDependencies);
    };

    private installDependenciesCmd() {
        console.log("Installing missing dependencies...")
        let installCommand = "npm i";
        if (this.project.npmRegistry) {
            installCommand += " --registry " + this.project.npmRegistry;
        }
        if (!processUtils.runProcess(installCommand)) {
            throw "";
        }
    };

    public reinstallDependencies() {
        let moduleDirPath = this.getModulePath();
        if (fs.existsSync(moduleDirPath)) {
            console.log("Removing dependencies...")
            if (!pathUtils.recursiveRemoveDirSync(moduleDirPath)) {
                throw "Directory " + moduleDirPath + " can not be removed.";
            }
        }
        this.installDependenciesCmd();
    }

    public installMissingDependencies() {
        this.findMissingModules();
        if (this.missingModules.length == 0) return;
        this.installDependenciesCmd();
    }

}

export function installMissingDependencies(project: bb.IProject): boolean {
    try {
        let depChecker = new DependenciesChecker(project);
        depChecker.installMissingDependencies();
    }
    catch (ex) {
        console.error("Failed to install dependencies.")
        return false;
    }
    return true;
}

export function registerCommands(c: commander.IExportedCommand, consumeCommand: Function) {
    c.command("dep")
        .option("-r, --reinstall", "reinstall dependencies")
        .option("-i, --install", "install dependencies")
        .action((c) => {
            consumeCommand();
            let curProjectDir = bb.currentDirectory();
            let project = bb.createProjectFromDir(curProjectDir);
            project.logCallback = (text) => {
                console.log(text);
            };
            if (!bb.refreshProjectFromPackageJson(project, null)) {
                process.exit(1);
            }
            try {
                let depChecker = new DependenciesChecker(project);
                if (c.reinstall) {
                    depChecker.reinstallDependencies();
                    return;
                }
                if (c.install) {
                    depChecker.installMissingDependencies();
                    return;
                }
            }
            catch (ex) {
                console.error("Failed to install dependencies.", ex)
                process.exit(1);
            }
        });
}

