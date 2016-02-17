def forkSettingsRun = [
        minMemory: 1536,
        maxMemory: 4096,
        maxPerm  : 384,
        debug    : false,
]
def forkSettingsOther = [
        minMemory: 256,
        maxMemory: 1024,
        maxPerm  : 384,
        debug    : false,
]

grails.project.fork = [
        test   : false,
        run    : forkSettingsRun,
        war    : false,
        console: forkSettingsOther]

grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"

def dm, dmClass
try {
    dmClass = new GroovyClassLoader().parseClass(
            new File('../transmart-dev/DependencyManagement.groovy'))
} catch (Exception e) {
}
if (dmClass) {
    dm = dmClass.newInstance()
}

grails.project.dependency.resolver = 'maven'
grails.project.dependency.resolution = {
    log "warn"
    legacyResolve false
    inherits('global') {}
    if (!dm) {
        repositories {
            grailsCentral()
            mavenLocal()
            mavenCentral()
            mavenRepo 'https://repo.transmartfoundation.org/content/repositories/public/'
            mavenRepo 'https://repo.thehyve.nl/content/repositories/public/'
        }
    } else {
        dm.configureRepositories delegate
    }
    dependencies {
        // compile 'org.apache.ant:ant:1.9.6'
        compile 'net.sf.opencsv:opencsv:2.3'
        compile 'org.rosuda:Rserve:1.7.3'
        compile 'org.mapdb:mapdb:0.9.10'

        /* serializable ImmutableMap only on guava 16 */
        compile group: 'com.google.guava', name: 'guava', version: '16.0-dev-20140115-68c8348'
        compile 'org.transmartproject:transmart-core-api:1.2.2-SNAPSHOT'
        //test 'com.jayway.restassured:rest-assured:2.4.1'

        runtime 'org.javassist:javassist:3.16.1-GA'

        test('org.gmock:gmock:0.9.0-r435-hyve2') {
            transitive = false /* don't bring groovy-all */
            export     = false
        }
    }
    plugins {
        compile "org.grails.plugins:asset-pipeline:2.6.10"

        compile ":sendfile:0.2"
        build ':tomcat:7.0.47', {
            export = false
        }
        test ':functional-test:2.0.0'
        test ':karma-test-runner:0.2.4'

        // core-db doesn't export hibernate as dep as it was builtin in 2.2.4
        //runtime ':hibernate:3.6.10.16'

        if (!dm) {
            runtime ':transmart-core:1.2.2-SNAPSHOT'

            test ':transmart-core:1.2.2-SNAPSHOT'
            test ':transmart-core-db-tests:1.2.2-SNAPSHOT'
        } else {
            dm.internalDependencies delegate
        }

    }
}

dm?.with {
    configureInternalPlugin 'runtime', 'transmart-core'
    configureInternalPlugin 'test', 'transmart-core'
    configureInternalPlugin 'test', 'transmart-core-db-tests'
}

dm?.inlineInternalDependencies grails, grailsSettings
