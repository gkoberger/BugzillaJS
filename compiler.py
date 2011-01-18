import os, os.path, shutil

def compress(in_files, out_file, in_type='js', verbose=False,
             temp_file='.temp', full_file=False):
    temp = open(temp_file, 'w')
    for f in in_files:
        fh = open(f)
        data = fh.read() + '\n'
        fh.close()

        temp.write(data)

        print ' + %s' % f
    temp.close()

    options = ['-o "%s"' % out_file,
               '--type %s' % in_type]

    if verbose:
        options.append('-v')

    os.system('python compiler-'+in_type+'.py < %s > %s' % (temp_file, out_file))

    org_size = os.path.getsize(temp_file)
    new_size = os.path.getsize(out_file)

    print '=> %s' % out_file
    print 'Original: %.2f kB' % (org_size / 1024.0)
    print 'Compressed: %.2f kB' % (new_size / 1024.0)
    print 'Reduction: %.1f%%' % (float(org_size - new_size) / org_size * 100)
    print ''

    if temp_file == '.temp':
        os.remove(temp_file)

SCRIPTS = [
        'js/jquery.js',
        'js/md5.js',
        'js/date.js',
        'js/bugzilla.js',
        ]
SCRIPTS_OUT_DEBUG = 'min/bugzilla.debug.js'
SCRIPTS_OUT = 'min/bugzilla.min.js'

STYLESHEETS = [
    'style.css',
    ]
STYLESHEETS_OUT = 'min/style.min.css'

USERSCRIPT_HEADER = 'js/bugzillafull_headers.js'
USERSCRIPT_OUT = 'bugzillajs-full.user.js'

def main():

    os.system('rm -r -f min; mkdir min')

    print 'Compressing JavaScript...'
    compress(SCRIPTS, SCRIPTS_OUT, 'js', False, SCRIPTS_OUT_DEBUG)

    print 'Compressing CSS...'
    compress(STYLESHEETS, STYLESHEETS_OUT, 'css')

    print 'Creating full userscript...'
    userscript([USERSCRIPT_HEADER, SCRIPTS_OUT_DEBUG], STYLESHEETS_OUT,
                USERSCRIPT_OUT)

def userscript(scripts, stylesheets, output):
    if not isinstance(scripts, list):
        scripts = [scripts]
    if not isinstance(stylesheets, list):
        stylesheets = [stylesheets]

    o = open(output, 'w')
    for f in scripts:
        fh = open(f)
        data = fh.read() + '\n'
        fh.close()

        o.write(data)

        print ' + %s' % f

    for f in stylesheets:
        fh = open(f)
        data = fh.read()
        fh.close()

        #o.write("$('<style type=text/css>').appendTo($('head')).html('%s');" %
        #        data.strip())

        print ' + %s' % f
    o.close()

if __name__ == '__main__':
    main()

